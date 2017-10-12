import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'
import { Router } from '@angular/router'

import { Folder } from '../core/Folder'
import { ProfileService } from '../core/profile/profile.service'
import { StorageService } from '../core/storage/storage.service'
import { UiService } from '../core/ui/ui.service'

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
    log.debug('storage click')
  }

  getRouterLink (folder: Folder) {
    return folder.key === 'home' ? '/' : folder.route
  }
}
