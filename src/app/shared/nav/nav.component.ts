import { Component, EventEmitter, Output } from '@angular/core'
import { Router, RouterLinkActive } from '@angular/router'

import { Folder } from '../../core/Folder'
import { StorageService } from '../../core/storage/storage.service'
@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  @Output() folderChange: EventEmitter<Folder>

  public quota: number
  public usage: number
  public isStorageManagerAvailable: boolean

  constructor (
    private router: Router,
    public storage: StorageService
  ) {
    this.folderChange = new EventEmitter()
    const nav: any = navigator
    if (nav.storage && nav.storage.estimate) {
      this.isStorageManagerAvailable = true
      nav.storage.estimate()
        .then(({quota, usage}: {quota: number, usage: number}) => {
          this.quota = quota
          this.usage = usage
        })
    } else {
      this.isStorageManagerAvailable = false
    }
  }

  createDoc () {
    this.router.navigate(['/', this.storage.generateKey()])
  }

  isHome (rla: RouterLinkActive) {
    return rla.isActive || this.router.url === '/docs/home'
  }
}
