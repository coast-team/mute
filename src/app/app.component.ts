import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs/Rx'

import { environment } from '../environments/environment'
import { UiService } from 'core/ui/ui.service'
import { ProfileService } from 'core/profile/profile.service'
import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'
import { AbstractStorageService } from 'core/storage/AbstractStorageService'
import { Folder } from 'core/storage/Folder'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('toolbarElm') toolbarElm
  @ViewChild('leftSidenavElm') leftSidenavElm
  public visible: boolean
  public rootFolderTitle: Observable<string>
  public innerWidth = window.innerWidth

  constructor (
    public sm: StorageManagerService,
    private router: Router,
    public ui: UiService,
    public profile: ProfileService
  ) {
    this.visible = environment.devLabel
    this.rootFolderTitle = this.sm.onActiveFolder
      .filter((folder) => folder !== null)
      .pluck('title')
  }

  ngOnInit () {
    this.leftSidenavElm.onClose.subscribe(() => {
      this.ui.navOpened = false
    })
    this.ui.onNavToggle.subscribe((open: boolean) => {
      this.leftSidenavElm.opened = open
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
