import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'

import { environment } from '@environments/environment'
import { appData } from '../../../app-data'
import { Folder } from '../../core/Folder'
import { SettingsService } from '../../core/settings'
import {
  BotStorageService,
  BotStorageServiceStatus,
  LocalStorageService
} from '../../core/storage'
import { UiService } from '../../core/ui'
import {
  ConfigDialogComponent
} from '../dialogs'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent implements OnDestroy {
  @Input()
  selected: Folder

  // Folders
  public local: Folder
  public trash: Folder
  public remote: Folder

  // Which storage is available
  public remoteErrorMessage: string
  public isRemoteExist: boolean
  public localErrorMessage: string

  // Storage manager
  public isStorageManagerAvailable: boolean
  public quota: number
  public usage: number

  public version: string
  public isProd: boolean
  public isStandalone: boolean

  private subs: Subscription[]

  public _pulsarOn: boolean

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    private settings: SettingsService,
    public ui: UiService
  ) {
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches
    this.isProd = environment.production
    this.version = appData.version
    this.local = localStorage.local
    this.trash = localStorage.trash
    this.remote = localStorage.remote
    this.subs = []
    this.isRemoteExist = this.localStorage.remote !== undefined
    this.subs[this.subs.length] = this.botStorage.onStatus.subscribe((code) => {
      switch (code) {
        case BotStorageServiceStatus.NOT_RESPONDING:
          this.remoteErrorMessage = 'Remote server is not responding'
          break
        case BotStorageServiceStatus.NOT_AUTHORIZED:
          this.remoteErrorMessage = 'Unavailable for non authenticated users'
          break
        case BotStorageService.AVAILABLE:
          this.remoteErrorMessage = undefined
          break
      }
      this.cd.markForCheck()
    })

    switch (this.localStorage.status) {
      case LocalStorageService.NOT_SUPPORTED:
        this.localErrorMessage = 'Not supported in your browser'
        break
      case LocalStorageService.NO_ACCESS:
        this.localErrorMessage = 'Disabled by your browser'
        break
      case LocalStorageService.AVAILABLE:
        this.localErrorMessage = undefined
        break
    }

    // this.cd.markForCheck()
    const nav: any = navigator
    if (nav.storage && nav.storage.estimate) {
      this.isStorageManagerAvailable = true
      nav.storage.estimate().then(({ quota, usage }: { quota: number; usage: number }) => {
        this.quota = quota
        this.usage = usage
        this.cd.markForCheck()
      })
    } else {
      this.isStorageManagerAvailable = false
    }
  }

  ngOnDestroy () {
    this.subs.forEach((sub) => sub.unsubscribe())
  }

  get pulsarOn () {
    return this._pulsarOn
  }

  //Cette fonction a été déplacé dans create-document-dialog.component
  createDoc (remotely = false) {
    const key = this.localStorage.generateSignalingKey()
    if (remotely) {
      this.router.navigate(['/', key, { remote: true }])
    } else {
      this.router.navigate(['/', key])
    }
  }

  //Cette fonction a été déplacé dans create-document-dialog.component
  createDocPulsar (pulsar = false) {
    const key = this.localStorage.generateSignalingKey()
    if (pulsar) {
      this.router.navigate(['/', key, { pulsar: true }])
    } else {
      this.router.navigate(['/', key])
    }
  }

  openFolder(folder: Folder) {
    this.settings.updateOpenedFolder(folder)
    this.selected = folder
    this.router.navigate(['/'])
  }

  openSettingsDialog() {
    this.dialog.open(ConfigDialogComponent)
  }


  update() {
    document.location.reload()
  }

  install() {
    const deferredPrompt = this.ui.appInstallEvent as any
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      this.ui.appInstall.next(false)
      this.ui.appInstallEvent = undefined
    })
  }
}
