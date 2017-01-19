import { Component } from '@angular/core'
import { Router } from '@angular/router'

import { AbstractStorageService } from 'core/storage/AbstractStorageService'
import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  private router: Router
  private storageManager: StorageManagerService

  constructor (
    router: Router,
    storageManager: StorageManagerService
  ) {
    this.router = router
    this.storageManager = storageManager
  }

  getStorageServices (): AbstractStorageService[] {
    return this.storageManager.getStorageServices()
  }

  setCurrentStorageService (storageService: AbstractStorageService) {
    this.storageManager.setCurrentStorageService(storageService)
  }

  newDoc () {
    const MIN_LENGTH = 10
    const DELTA_LENGTH = 0
    const MASK = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    const length = MIN_LENGTH + Math.round(Math.random() * DELTA_LENGTH)

    for (let i = 0; i < length; i++) {
      key += MASK[Math.round(Math.random() * (MASK.length - 1))]
    }
    this.router.navigate(['doc/' + key])
  }
}
