import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router, RouterLinkActive } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'

import { environment } from '../../../environments/environment'
import { Folder } from '../../core/Folder'
import { SettingsService } from '../../core/settings/settings.service'
import { BotStorageService } from '../../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'
import { ConfigDialogComponent } from '../config-dialog/config-dialog.component'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent implements OnDestroy {
  @Input() selected: Folder
  @Output() change: EventEmitter<Folder>

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

  private subs: Subscription[]

  constructor (
    private router: Router,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    private settings: SettingsService
  ) {
    this.local = localStorage.local
    this.trash = localStorage.trash
    this.remote = botStorage.remote
    this.change = new EventEmitter()
    this.subs = []
    this.isRemoteExist = this.botStorage.remote !== undefined
    this.subs[this.subs.length] = this.botStorage.onStatus.subscribe((code) => {
      switch (code) {
      case BotStorageService.NOT_RESPONDING:
        this.remoteErrorMessage = 'Remote server is not responding'
        break
      case BotStorageService.NOT_AUTHORIZED:
        this.remoteErrorMessage = 'Unavailable for non authenticated users'
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
    }
    // this.cd.markForCheck()
    const nav: any = navigator
    if (nav.storage && nav.storage.estimate) {
      this.isStorageManagerAvailable = true
      nav.storage.estimate()
        .then(({quota, usage}: {quota: number, usage: number}) => {
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

  createDoc (remotely = false) {
    this.localStorage.createDoc()
      .then((doc) => {
        this.localStorage.save(doc)
        if (remotely) {
          this.router.navigate(['/', doc.key, {remote: true}])
        } else {
          this.router.navigate(['/', doc.key])
        }
      })
      .catch((err) => {
        log.warn('Failed to create a document locally: ', err)
      })
  }

  openFolder (folder: Folder) {
    this.settings.updateOpenedFolder(folder)
    this.selected = folder
    this.change.emit(folder)
    this.router.navigate(['/'])
  }

  openSettingsDialog () {
    this.dialog.open(ConfigDialogComponent)
  }
}
