import { DataSource } from '@angular/cdk/collections'
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { MatDialog, MatSidenav, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { throttleTime } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import { Doc } from '../core/Doc'
import { File } from '../core/File'
import { Folder } from '../core/Folder'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot-storage/bot-storage.service'
import { LocalStorageService } from '../core/storage/local-storage.service'
import { UiService } from '../core/ui/ui.service'
import { RenameDocDialogComponent } from './dialogs/rename-doc-dialog.component'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnDestroy, OnInit {

  @ViewChild('leftSidenav') leftSidenav: MatSidenav
  @ViewChild('rightSidenav') rightSidenav

  private subs: Subscription[]
  public folder: Folder
  public title: string
  public displayedColumns = ['title', 'key', 'created', 'storage']

  public docsSubject: BehaviorSubject<Doc[]>
  public docsSource: DocsSource
  public docs: Doc[]
  public sideNavMode = 'side'
  public isFinishOpen: boolean
  public isMenu: boolean
  public menuDoc: Doc

  constructor (
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private botStorage: BotStorageService,
    private settings: SettingsService,
    public storage: LocalStorageService,
    public ui: UiService,
    public media: ObservableMedia,
    public dialog: MatDialog
  ) {
    this.docsSubject = new BehaviorSubject([])
    this.docsSource = new DocsSource(this.docsSubject)
    this.title = ''
    this.subs = []
  }

  ngOnInit () {
    this.subs[this.subs.length] = this.route.data
      .subscribe(({ folder }) => this.openFolder(folder))

    this.subs[this.subs.length] = this.settings.onProfileChange
      .subscribe(() => this.openFolder(this.storage.local))

    this.subs[this.subs.length] = this.media.asObservable().subscribe((change: MediaChange) => {
      if (change.mqAlias === 'xs') {
        this.sideNavMode = 'over'
      }
      this.isMenu = change.mqAlias === 'xs' || change.mqAlias === 'sm'
      if (this.isMenu) {
        this.displayedColumns = ['title']
      }
    })
  }

  ngOnDestroy () {
    this.docsSubject.complete()
    this.subs.forEach((s) => s.unsubscribe())
  }

  moveToTrash (doc: Doc) {
    this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
    this.docsSubject.next(this.docs)
    this.storage.moveDoc(doc, this.storage.trash.route)
      .then(() => {
        this.snackBar.open(`"${doc.title}" moved to trash.`, 'Undo', {
          duration: 5000
        }).onAction().subscribe(() => {
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

  restore (doc: Doc): Promise<void> {
    return this.storage.moveDoc(doc, doc.previousLocation)
      .then(() => {
        this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
        this.docsSubject.next(this.docs)
      })
  }

  infoDoc () {
    this.rightSidenav.open()
  }

  delete (doc: Doc) {
    this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
    this.docsSubject.next(this.docs)
    this.storage.deleteDoc(doc)
      .then(() => {
        this.snackBar.open(`"${doc.title}" has been deleted.`, 'close', {
          duration: 3000
        })
      })
  }

  open (doc: Doc) {
    if (this.folder.route !== '/trash') {
      this.router.navigate(['/', doc.key])
    }
  }

  share (doc: Doc) { // Workaround, but not pretty
    const aux = document.createElement('input')
    aux.setAttribute('value', `${window.location.origin}/${doc.key}`)
    document.body.appendChild(aux)
    aux.select()
    document.execCommand('copy')
    document.body.removeChild(aux)
    this.snackBar.open(`Link copied to clipboard.`, 'Close', {
      duration: 5000
    })
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

  isActionsVisible (doc) {
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
    const dialogRef = this.dialog.open(RenameDocDialogComponent, {
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

  stopPropagation (event: Event) {
    event.stopPropagation()
  }

  openFolder (folder) {
    this.folder = folder
    this.isFinishOpen = false
    this.storage.getFiles(folder)
      .then((files: File[]) => {
        this.docs = files.filter((file: File) => file.isDoc) as Doc[]
        this.docsSubject.next(this.docs)
        this.isFinishOpen = true
        const keys = this.docs.map((doc: Doc) => doc.key)
        return this.botStorage.whichExist(keys)
      })
      .then((existedKeys) => {
        this.docs.forEach((doc: Doc) => {
          if (existedKeys.includes(doc.key)) {
            doc.setBotStorage([this.botStorage.bot])
          }
        })
      })
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
