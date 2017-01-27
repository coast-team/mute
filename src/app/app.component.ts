import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'

import { environment } from '../environments/environment'
import { UiService } from 'core/ui/ui.service'
import { ProfileService } from 'core/profile/profile.service'
import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'
import { AbstractStorageService } from 'core/storage/AbstractStorageService'


@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('toolbarElm') toolbarElm
  @ViewChild('leftSidenavElm') leftSidenavElm
  public visible: boolean
  public storageName: string
  public innerWidth = window.innerWidth

  constructor (
    private storageManager: StorageManagerService,
    private router: Router,
    public ui: UiService,
    public profile: ProfileService
  ) {
    this.visible = environment.devLabel
  }

  ngOnInit () {
    this.leftSidenavElm.onClose.subscribe(() => {
      this.ui.navOpened = false
    })
    this.ui.onNavToggle.subscribe((open: boolean) => {
      this.leftSidenavElm.opened = open
    })
    this.storageManager.onStorageService.subscribe((storage: AbstractStorageService) => {
      this.storageName = storage.name
    })
    this.ui.openNav()
  }

  isDoc () {
    return this.router.url.includes('doc')
  }

  updatePseudo (pseudo: string) {
    this.profile.pseudonym = pseudo
  }

  updateTitle (title: string) {
    log.debug('New title: ' + title)
  }
}
