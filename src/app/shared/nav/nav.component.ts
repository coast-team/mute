import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router, RouterLinkActive } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'

import { environment } from '../../../environments/environment'
import { Folder } from '../../core/Folder'
import { BotStorageService, BotStorageStatus } from '../../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'
import { StorageService } from '../../core/storage/storage.service'
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

  public quota: number
  public usage: number
  public isStorageManagerAvailable: boolean
  public local: Folder
  public trash: Folder
  public all: Folder
  public remote: Folder
  public isRemoteExist: boolean
  public isRemoteAvailable: boolean
  public remoteErrorMessage: string
  public remoteStatus: BotStorageStatus

  private subs: Subscription[]

  constructor (
    private router: Router,
    private cd: ChangeDetectorRef,
    private storage: StorageService,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    private dialog: MatDialog
  ) {
    this.local = localStorage.local
    this.trash = localStorage.trash
    this.all = storage.all
    this.remote = botStorage.remote
    this.change = new EventEmitter()
    this.subs = []
    this.remoteErrorMessage = ''
    this.subs[this.subs.length] = this.botStorage.onStatusChange.subscribe((status) => {
      this.remoteStatus = status
      switch (status) {
      case BotStorageStatus.NOT_EXIST:
        this.remoteErrorMessage = ''
        this.isRemoteExist = false
        break
      case BotStorageStatus.EXIST:
        this.remoteErrorMessage = 'Checking...'
        this.isRemoteExist = true
        break
      case BotStorageStatus.NOT_RESPONDING:
        this.remoteErrorMessage = 'Remote server is not responding'
        this.isRemoteExist = true
        break
      case BotStorageStatus.NOT_AUTHORIZED:
        this.remoteErrorMessage = 'Remote server is unavailable for non authenticated users'
        this.isRemoteExist = true
        break
      case BotStorageStatus.AVAILABLE:
        this.remoteErrorMessage = undefined
        this.isRemoteExist = true
        break
      }
      this.cd.markForCheck()
    })
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

  createDoc () {
    this.router.navigate(['/', this.localStorage.generateKey()])
  }

  openFolder (folder: Folder) {
    this.selected = folder
    this.change.emit(folder)
  }

  openSettingsDialog () {
    this.dialog.open(ConfigDialogComponent)
  }
}
