import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { MdSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs/Rx'

import { AbstractStorageService } from 'core/storage/AbstractStorageService'
import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'
import { UiService } from 'core/ui/ui.service'
import { File } from 'core/storage/File'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnDestroy, OnInit {

  private activeFileSubs: Subscription
  private hasDocuments: boolean
  private docsSubject: BehaviorSubject<any>

  private snackBarSubject: Subject<string>

  public activeFile: File

  constructor (
    private router: Router,
    private snackBar: MdSnackBar,
    private sm: StorageManagerService,
    public ui: UiService,
    private ref: ChangeDetectorRef
  ) {
    this.docsSubject = new BehaviorSubject([])
    this.snackBarSubject = new Subject()
  }

  ngOnInit () {
    log.angular('DocsComponent init')
    this.activeFileSubs = this.sm.onActiveFile.subscribe((folder: File) => {
      if (folder !== null) {
        this.activeFile = folder
        this.docsSubject.next([])
        folder.getDocuments()
          .then((docs: any) => {
            this.docsSubject.next(docs)
            // FIXME: have to call detectChanges() for document list view update
            this.ref.detectChanges()
          })
      }
    })
    this.ui.openNav()

    this.snackBarSubject
      .throttleTime(500)
      .subscribe((message: string) => {
        this.snackBar.open(message, 'close', {
          duration: 3000
        })
      })
  }

  get docs () {
    return this.docsSubject.asObservable()
  }

  ngOnDestroy () {
    this.snackBarSubject.complete()
    this.activeFileSubs.unsubscribe()
  }

  // getStorageServiceName (): string {
  //   const storageService = this.sm.getCurrentStorageService()
  //   return storageService === undefined ? '' : storageService.name
  // }

  getDocuments (): Promise<any> {
    // const storageService = this.sm.getCurrentStorageService()
    // return storageService.getDocuments()
    return Promise.resolve([])
  }

  deleteAllDocs (): void {
    // const storageService = this.sm.getCurrentStorageService()
    // storageService.deleteAll()
    //   .then(() => {
    //     this.docs = []
    //     this.hasDocuments = false
    //   })
    //   .catch((err: Error) => {
    //     this.snackBarSubject.next(err.message)
    //   })
  }

  deleteDoc (key: string): void {
    // const storageService = this.sm.getCurrentStorageService()
    // storageService.delete(key)
    //   .then(() => {
    //     this.docs = this.docs.filter((doc: any) => doc.id !== key)
    //     this.hasDocuments = (this.docs.length > 0)
    //   })
    //   .catch((err: Error) => {
    //     this.snackBarSubject.next(err.message)
    //   })
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
