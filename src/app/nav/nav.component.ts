import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, Subscription } from 'rxjs/Rx'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'

import { StorageService } from '../core/storage/storage.service'
import { Folder } from '../core/Folder'
import { File } from '../core/File'
import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  @ViewChild('inputPseudo') public inputPseudo: ElementRef

  public activeFolder: Folder
  public rootFolders: Folder[]

  constructor (
    public router: Router,
    public storage: StorageService,
    public ui: UiService,
    public media: ObservableMedia,
    public profile: ProfileService
  ) {
    switch (this.router.url) {
    case `/docs/${this.storage.home.route}`:
      this.activeFolder = this.storage.home
      break
    case `/docs/${this.storage.trash.route}`:
      this.activeFolder = this.storage.trash
      break
    }
    this.rootFolders = this.storage.getRootFolders()
    log.debug('Root folders: ', this.rootFolders)
  }

  ngOnInit () {

    // Initialize profile name
    this.inputPseudo.nativeElement.value = this.profile.pseudonym
    if (this.activeFolder) {
      this.ui.setActiveFile(this.activeFolder)
    }
  }

  newDoc () {
    const doc = this.storage.createDoc()
    this.ui.setActiveFile(doc)
    this.router.navigate(['/', doc.key])
  }

  setActiveFile ({value}) {
    this.ui.setActiveFile(value)
  }

  updatePseudo (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.inputPseudo.nativeElement.blur()
    } else if (event.type === 'blur') {
      const newPseudo = this.inputPseudo.nativeElement.value
      if (this.profile.pseudonym !== newPseudo) {
        this.profile.pseudonym = (newPseudo === '') ?
          this.profile.pseudonymDefault : newPseudo
      }
    }
  }

  selectPseudo () {
    this.inputPseudo.nativeElement.select()
  }

  onStorageClick () {
    if (this.media.isActive('xs')) {
      this.ui.toggleNav()
    }
  }

  getRouterLink (folder: Folder) {
    const link = folder.key === 'home' ? '/' : folder.route
    return folder.key === 'home' ? '/' : folder.route
  }
}
