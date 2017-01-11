import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Rx'

import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnDestroy, OnInit {

  private router: Router
  private storageManagerService: StorageManagerService
  private docsSubscription: Subscription
  private docs: any[]
  private hasDocuments: boolean

  constructor (router: Router, storageManagerService: StorageManagerService) {
    this.router = router
    this.storageManagerService = storageManagerService
  }

  ngOnInit () {
    this.docsSubscription = this.storageManagerService.onDocs.subscribe((docs: any[]) => {
      this.docs = docs
      this.hasDocuments = (this.docs.length > 0)
    })
  }

  ngOnDestroy () {
    this.docsSubscription.unsubscribe()
  }

  isStorageServiceSelected (): boolean {
    const storageService = this.storageManagerService.getCurrentStorageService()
    return storageService !== null
  }

  getDocuments (): Promise<any> {
    const storageService = this.storageManagerService.getCurrentStorageService()
    return storageService.getDocuments()
  }

  openDoc (key: string) {
    this.router.navigate(['doc/' + key])
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
