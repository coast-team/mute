import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'
import { Router } from '@angular/router'

import { Folder } from '../core/Folder'
import { Profile } from '../core/profile/Profile'
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
  public profile: Profile

  constructor (
    public router: Router,
    public storage: StorageService,
    public ui: UiService,
    public media: ObservableMedia,
    public profileService: ProfileService
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
    this.profileService.onProfile.subscribe((profile: Profile) => {
      this.profile = profile
      this.inputPseudo.nativeElement.value = profile.displayName
    })

    // Initialize profile name
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

  updateDisplayName (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.inputPseudo.nativeElement.blur()
    } else if (event.type === 'blur') {
      const newPseudo = this.inputPseudo.nativeElement.value
      if (this.profile.displayName !== newPseudo) {
        this.profile.displayName = (newPseudo === '') ? this.profile.displayName : newPseudo
        this.profileService.updateProfile()
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
    return folder.key === 'home' ? '/' : folder.route
  }
}
