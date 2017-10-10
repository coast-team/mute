import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, Inject, ElementRef } from '@angular/core'
import { MatInput, MatSnackBar, MatMenuTrigger, MatMenu, MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { DataSource } from '@angular/cdk/collections'
import { FormControl, Validators } from '@angular/forms'

import { StorageService } from '../core/storage/storage.service'
import { Folder } from '../core/Folder'
import { File } from '../core/File'
import { Doc } from '../core/Doc'
import { UiService } from '../core/ui/ui.service'
import { WindowRefService } from '../core/WindowRefService'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnDestroy, OnInit {

  @ViewChild('leftSidenavElm') leftSidenavElm
  @ViewChild('rightSidenavElm') rightSidenavElm

  private mediaSubscription: Subscription
  private activeMediaQuery: string

  private snackBarSubject: Subject<string>
  private activeFolderSubs: Subscription
  public activeFolder: Folder
  public displayedColumns = ['title', 'key', 'created', 'storage']

  public docsSubject: BehaviorSubject<Doc[]>
  public docsSource: DocsSource
  public docs: Doc[]
  public sideNavMode = 'side'
  public isFinishFetching: boolean
  public isMenu: boolean
  public menuDoc: Doc

  constructor (
    private router: Router,
    private snackBar: MatSnackBar,
    private windowRef: WindowRefService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    public storage: StorageService,
    public ui: UiService,
    public media: ObservableMedia,
    public dialog: MdDialog
  ) {
    this.snackBarSubject = new Subject()
    this.docsSubject = new BehaviorSubject([])
    this.docsSource = new DocsSource(this.docsSubject)
  }

  ngOnInit () {
    this.activeFolderSubs = this.route.data
      .subscribe(({ file }: {file: Folder}) => {
        this.activeFolder = file
        this.isFinishFetching = false
        this.storage.getFiles(file)
          .then((files: File[]) => {
            this.docs = <Doc[]> files.filter((file: File) => file.isDoc)
            this.docsSubject.next(this.docs)
            this.isFinishFetching = true
          })
      })

    this.mediaSubscription = this.media.asObservable().subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : ''
      if (change.mqAlias === 'xs') {
        this.sideNavMode = 'over'
      }
      this.isMenu = change.mqAlias === 'xs' || change.mqAlias === 'sm'
      if (this.isMenu) {
        this.displayedColumns = ['title']
      }
    })

    this.ui.onNavToggle.subscribe(() => {
      this.leftSidenavElm.opened = !this.leftSidenavElm.opened
    })

    this.ui.onDocNavToggle.subscribe(() => {
      this.rightSidenavElm.opened = !this.rightSidenavElm.opened
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
    this.mediaSubscription.unsubscribe()
    this.activeFolderSubs.unsubscribe()
    this.docsSubject.complete()
  }

  moveToTrash (doc: Doc) {
    this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
    this.docsSubject.next(this.docs)
    this.storage.moveDoc(doc, this.storage.trash.route)
      .then(() => {
        this.snackBar.open(`"${doc.title}" moved to trash.`, 'Undo', {
          duration: 5000
        }).onAction().subscribe((obj) => {
          this.storage.moveDoc(doc, doc.previousLocation)
            .then(() => {
              this.docs[this.docs.length] = doc
              this.docsSubject.next(this.docs)
            })
        })
      })
  }

  setMenuDoc (doc: Doc) {
    this.menuDoc = doc
  }

  restore (doc: Doc): Promise<undefined> {
    return this.storage.moveDoc(doc, doc.previousLocation)
      .then(() => {
        this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
        this.docsSubject.next(this.docs)
      })
  }

  infoDoc (doc: Doc) {
    this.rightSidenavElm.open()
  }

  deleteDoc (doc: Doc) {
    this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
    this.docsSubject.next(this.docs)
    this.storage.deleteDoc(doc)
      .then(() => {
        this.snackBar.open(`"${doc.title}" has been deleted.`)
      })
  }

  openDoc (doc: Doc) {
    this.ui.setActiveFile(doc)
    this.router.navigate(['/', doc.key])
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

  shareDoc (doc: Doc) { // Workaround, but not pretty
    const aux = document.createElement('input')
    aux.setAttribute('value', 'https://' + this.windowRef.window.location.hostname + '/' + doc.key)
    document.body.appendChild(aux)
    aux.select()
    document.execCommand('copy')
    document.body.removeChild(aux)
    this.snackBarSubject.next(`"${doc.title}" shared link has been copied.`)
  }

  showActions (doc: any) {
    if (doc.actionsVisible === 'false' || doc.actionsVisible === undefined) {
      doc.actionsVisible = 'true'
    }
  }

  hideActions (doc: any) {
    if (doc.actionsVisible === 'true') {
      doc.actionsVisible = 'false'
    }
  }

  getActionsVisible (doc) {
    return doc.actionsVisible
  }

  updateTitle (event: any, doc: any) {
    if (event.type === 'blur' || (event.type === 'keydown' && event.code === 'Enter')) {
      if (event.type === 'keydown') {
        event.preventDefault()
        event.target.blur()
      }
      doc.title = event.target.textContent
      event.target.textContent = doc.title
      this.storage.updateFile(doc)
    }
  }

  updateTitleDialog (doc: Doc) {
    log.debug('Doc ', doc)
    const dialogRef = this.dialog.open(RenameDocumentDialogComponent, {
      data: { title: doc.title }
    })
    dialogRef.afterClosed().subscribe((newTitle: string) => {
      if (newTitle !== undefined) {
        doc.title = newTitle
        this.storage.updateFile(doc)
      }
    })
  }

  getTitleEditable (doc: any) {
    return doc.titleEditable
  }
}

class DocsSource extends DataSource<any> {
  constructor (
    private docs: Subject<Doc[]>
  ) {
    super()
  }
  connect (): Observable<Doc[]> {
    return this.docs
  }
  disconnect () {}
}

@Component({
  selector: 'mute-rename-document-dialog',
  templateUrl: 'rename-document-dialog.html',
})
export class RenameDocumentDialogComponent {

  @ViewChild('titleRef') titleRef: ElementRef
  titleControl: FormControl

  constructor (
    public dialogRef: MdDialogRef<RenameDocumentDialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: { title: string }
  ) {
    this.titleControl = new FormControl('', [Validators.required])
  }

  selectAll () {
    this.titleRef.nativeElement.select()
  }

  close (): void {
    this.dialogRef.close()
  }

}
