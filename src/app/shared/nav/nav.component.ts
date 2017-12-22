import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'
import { Router, RouterLinkActive } from '@angular/router'

import { Folder } from '../../core/Folder'
import { StorageService } from '../../core/storage/storage.service'
@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  @Input() activeFolder: Folder
  @Output() onFolder: EventEmitter<Folder>

  public rootFolders: Folder[]

  constructor (
    public router: Router,
    public storage: StorageService
  ) {
    this.rootFolders = this.storage.getRootFolders()
    this.onFolder = new EventEmitter()
  }

  createDoc () {
    this.router.navigate(['/', this.storage.generateKey()])
  }

  isHome (rla: RouterLinkActive) {
    return rla.isActive || this.router.url === '/docs/home'
  }
}
