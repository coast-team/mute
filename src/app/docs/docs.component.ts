import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Rx'

import { AbstractStorageService } from 'core/storage/AbstractStorageService'
import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'
import { UiService } from 'core/ui/ui.service'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnDestroy, OnInit {

  private docsSubscription: Subscription
  private docs: any[]
  private hasDocuments: boolean

  @ViewChild('leftSidenavElm') leftSidenavElm

  public leftVisible = true

  constructor (
    private router: Router,
    private storageManagerService: StorageManagerService,
    public ui: UiService
) {}

  ngOnInit () {
    this.leftSidenavElm.onClose.subscribe(() => {
      this.ui.navOpened = false
      this.leftVisible = true
    })
    this.leftSidenavElm.onOpenStart.subscribe(() => {
      this.leftVisible = false
    })
    this.ui.onNavToggle.subscribe((open: boolean) => {
      this.leftSidenavElm.opened = open
    })
    this.docsSubscription = this.storageManagerService.onDocs.subscribe((docs: any[]) => {
      this.docs = docs
      this.hasDocuments = (this.docs.length > 0)
    })
    this.ui.openNav()
    this.ui.toolbarTitle = this.getStorageServiceName()
  }

  ngOnDestroy () {
    this.docsSubscription.unsubscribe()
  }

  isStorageServiceSelected (): boolean {
    const storageService = this.storageManagerService.getCurrentStorageService()
    return storageService instanceof AbstractStorageService
  }

  getStorageServiceName (): string {
    const storageService = this.storageManagerService.getCurrentStorageService()
    return storageService === undefined ? '' : storageService.name
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
