import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'
import { MdSnackBar, MdMenuTrigger, MdMenu } from '@angular/material'
import { Router } from '@angular/router'
import { Observable, Subject, Subscription } from 'rxjs/Rx'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'

import { LocalStorageService, BotStorageService } from '../core/storage'
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

  @ViewChild('leftSidenavElm') leftSidenavElm
  @ViewChild('rightSidenavElm') rightSidenavElm

  private activeFileSubs: Subscription
  private mediaSubscription: Subscription
  private activeMediaQuery: string

  private snackBarSubject: Subject<string>
  private activeFolder: Folder

  public docs: Doc[]
  public visibleBtns: boolean[]
  public sideNavMode = 'side'

  constructor (
    private router: Router,
    private snackBar: MdSnackBar,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    public ui: UiService,
    private ref: ChangeDetectorRef,
    public media: ObservableMedia,
  ) {
    this.snackBarSubject = new Subject()
    this.docs = []
    this.visibleBtns = []
  }

  ngOnInit () {
    this.mediaSubscription = this.media.asObservable().subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : ''
      if ( change.mqAlias === 'xs') {
        this.sideNavMode = 'over'
      }
    })

    this.ui.onNavToggle.subscribe(() => {
      this.leftSidenavElm.opened = !this.leftSidenavElm.opened
    })

    this.ui.onDocNavToggle.subscribe(() => {
      this.rightSidenavElm.opened = !this.rightSidenavElm.opened
    })

    this.activeFileSubs = this.ui.onActiveFile
      .filter((file: File) => file instanceof Folder)
      .subscribe((folder: Folder) => {
        this.activeFolder = folder
        folder.fetchFiles()
          .then((docs: Doc[]) => {
            this.docs = docs
            this.ref.detectChanges()
          })
      })

    this.snackBarSubject
      .throttleTime(500)
      .subscribe((message: string) => {
        this.snackBar.open(message, 'close', {
          duration: 5000
        })
      })
  }

  ngOnDestroy () {
    this.snackBarSubject.complete()
    this.activeFileSubs.unsubscribe()
    this.mediaSubscription.unsubscribe()
  }

  deleteAllDocs (): void {
    const snackMsg = (this.activeFolder.id !== 'trash') ?
      'All documents moved to trash' : 'All documents deleted'
    this.activeFolder.deleteFiles()
      .then(() => {
        this.docs = []
        this.snackBarSubject.next(snackMsg)
      })
      .catch((err: Error) => this.snackBarSubject.next(err.message))
  }

  deleteDoc (doc: Doc): void {
    let snackMsg
    if (doc.localFolder && doc.localFolder.id !== 'trash') {
      snackMsg = 'Document moved to trash'
    } else {
      snackMsg = 'Document deleted'
    }
    doc.delete()
      .then(() => {
        this.docs = this.docs.filter((d: Doc) => doc.id !== d.id)
        this.snackBarSubject.next(snackMsg)
      })
      .catch((err: Error) => this.snackBarSubject.next(err.message))
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

  setVisible (index: number) {
    this.visibleBtns[index] = true
  }

  setHidden (index: number) {
    this.visibleBtns[index] = false
  }

  shareDoc (doc: Doc) { // Workaround, but not pretty
    const aux = document.createElement('input')
    aux.setAttribute('value', 'https://' + window.location.hostname + '/doc/' + doc.id.toString())
    document.body.appendChild(aux)
    aux.select()
    document.execCommand('copy')
    document.body.removeChild(aux)
    this.snackBarSubject.next('Address to ' + doc.id.toString() + ' is in clipboard!')
  }

}
