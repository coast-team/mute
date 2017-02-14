import { Component, OnDestroy, OnInit } from '@angular/core'
import { MdSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { Subject, Subscription } from 'rxjs/Rx'

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

  private snackBarSubject: Subject<string>

  constructor (
    private router: Router,
    private snackBar: MdSnackBar,
    private storageManagerService: StorageManagerService,
    public ui: UiService
) {}

  ngOnInit () {
    this.docsSubscription = this.storageManagerService.onDocs.subscribe((docs: any[]) => {
      this.docs = docs
      this.hasDocuments = (this.docs.length > 0)
    })
    this.ui.openNav()
    this.ui.toolbarTitle = this.getStorageServiceName()

    this.snackBarSubject = new Subject()
    this.snackBarSubject
      .throttleTime(500)
      .subscribe((message: string) => {
        this.snackBar.open(message, 'close', {
          duration: 3000
        })
      })
  }

  ngOnDestroy () {
    this.snackBarSubject.complete()

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

  deleteAllDocs (): void {
    const storageService = this.storageManagerService.getCurrentStorageService()
    storageService.deleteAll()
      .then(() => {
        this.docs = []
        this.hasDocuments = false
      })
      .catch((err: Error) => {
        this.snackBarSubject.next(err.message)
      })
  }

  deleteDoc (key: string): void {
    const storageService = this.storageManagerService.getCurrentStorageService()
    storageService.delete(key)
      .then(() => {
        this.docs = this.docs.filter((doc: any) => doc.id !== key)
        this.hasDocuments = (this.docs.length > 0)
      })
      .catch((err: Error) => {
        this.snackBarSubject.next(err.message)
      })
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
