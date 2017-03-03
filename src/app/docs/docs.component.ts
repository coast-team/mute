import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { MdSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { Observable, Subject, Subscription } from 'rxjs/Rx'

import { AbstractStorageService, LocalStorageService, BotStorageService } from '../core/storage'
import { Folder } from '../core/Folder'
import { File } from '../core/File'
import { Doc } from '../core/Doc'
import { UiService } from '../core/ui/ui.service'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnDestroy, OnInit {

  private activeFileSubs: Subscription
  private hasDocuments: boolean

  private snackBarSubject: Subject<string>
  private activeFolder: Folder

  public docs: Doc[]

  constructor (
    private router: Router,
    private snackBar: MdSnackBar,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    public ui: UiService,
    private ref: ChangeDetectorRef
  ) {
    this.snackBarSubject = new Subject()
  }

  ngOnInit () {
    log.angular('DocsComponent init')

    this.activeFileSubs = this.ui.onActiveFile
      .filter((file: File) => file instanceof Folder)
      .subscribe((folder: Folder) => {
        this.activeFolder = folder
        folder.getFiles()
          .then((docs: Doc[]) => {
            this.docs = docs
            this.ref.detectChanges()
          })
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

  ngOnDestroy () {
    this.snackBarSubject.complete()
    this.activeFileSubs.unsubscribe()
  }

  deleteAllDocs (): void {
    const snackMsg = (this.activeFolder.id !== 'trash') ?
      'All document moved to tash' : 'All document deleted'
    log.debug('deleteAllDocs from ', this.activeFolder )
    this.activeFolder.delete()
      .then(() => {
        this.docs = []
        this.hasDocuments = false
        this.snackBarSubject.next(snackMsg)
        this.ref.detectChanges()
      })
      .catch((err) => {
        log.warn('deleteAllDocs error: ', err)
        this.snackBarSubject.next(err)
      })
  }

  deleteDoc (doc: Doc): void {
    const snackMsg = (doc.parentId !== 'trash') ?
      'Document moved to tash' : 'Document deleted'
    doc.delete()
      .then(() => {
        this.docs = this.docs.filter((d: Doc) => doc.id !== d.id)
        this.hasDocuments = (this.docs.length > 0)
        this.ref.detectChanges()
        this.snackBarSubject.next(snackMsg)
      })
      .catch((err: Error) => {
        this.snackBarSubject.next(err.message)
      })
  }

  openDoc (doc: Doc) {
    this.ui.setActiveFile(doc)
    this.router.navigate(['/doc', doc.id])
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
