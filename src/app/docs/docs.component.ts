import { DataSource } from '@angular/cdk/table'
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Clipboard } from '@angular/cdk/clipboard';
import { MediaChange, MediaObserver } from '@angular/flex-layout'
import { MatDialog } from '@angular/material/dialog'
import { MatSidenav } from '@angular/material/sidenav'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Sort } from '@angular/material/sort'
import { Router } from '@angular/router'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { Doc } from '@app/core/Doc'
import { Folder } from '@app/core/Folder'
import { EProperties } from '@app/core/settings/EProperties.enum'
import { SettingsService } from '@app/core/settings'
import {
  BotStorageService,
  LocalStorageService
} from '@app/core/storage'
import { UiService } from '@app/core/ui'
import {
  DocRenameDialogComponent,
  RemoteDeleteDialogComponent,
  DocCreateDialogComponent
} from '../shared/dialogs' 

class DocsSource extends DataSource<Doc> {

  public sort: Sort

  private docs: Doc[]
  private docs$: BehaviorSubject<Doc[]>
  private sub: Subscription
  constructor(docs$: BehaviorSubject<Doc[]>, sort: Sort) {
    super()
    this.docs$ = docs$
    this.sort = sort
    this.sub = docs$.subscribe((docs) => (this.docs = docs))
  }

  connect(): Observable<Doc[]> {
    return this.docs$.pipe(map((docs) => this.getSortedDocs(docs, this.sort)))
  }

  disconnect() {
    this.sub.unsubscribe()
  }


  sortDocs(sort: Sort) {
    this.sort = sort
    this.docs$.next(this.getSortedDocs(this.docs, sort))
  }

  private getSortedDocs(docs: Doc[], sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return docs
    }

    docs.sort((a, b) => {
      const isAsc = sort.direction === 'asc'
      switch (sort.active) {
        case 'title':
          return this.compare(a.title, b.title, isAsc)
        case 'signalingKey':
          return this.compare(a.signalingKey, b.signalingKey, isAsc)
        case 'created':
          return this.compare(a.created, b.created, isAsc)
        case 'opened':
          return this.compare(a.opened, b.opened, isAsc)
        case 'modified':
          return this.compare(a.modified, b.modified, isAsc)
        default:
          return 0
      }
    })
    return docs
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1)
  }
}

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss'],
})
export class DocsComponent implements OnDestroy, OnInit {
  @ViewChild('leftSidenav', { static: true })
  leftSidenav: MatSidenav
  @ViewChild('rightSidenav', { static: true })
  rightSidenav
  public folder: Folder
  public title: string
  public displayedColumns: string[]

  public docsSubject: BehaviorSubject<Doc[]>
  public docsSource: DocsSource
  public docs: Doc[]
  public sideNavMode = 'side'
  public isFinishOpen: boolean
  public isMobile: boolean
  public menuDoc: Doc
  public remoteName: string
  public remoteId: string
  public sortDefault: Sort = { active: 'modified', direction: 'desc' }

  public actions

  private subs: Subscription[]
  private displayedColumnsLocal = ['title', 'created', 'opened', 'modified']
  private displayedColumnsRemote = ['title', 'location', 'created', 'opened', 'modified']

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private botStorage: BotStorageService,
    private settings: SettingsService,
    public localStorage: LocalStorageService,
    public ui: UiService,
    public media: MediaObserver,
    public dialog: MatDialog,
    private clipboard: Clipboard
  ) {
    this.docsSubject = new BehaviorSubject([])
    this.docsSource = new DocsSource(this.docsSubject, this.sortDefault)
    this.title = ''
    this.subs = []
    if (this.localStorage.remote) {
      this.remoteId = this.localStorage.remote.id
      this.displayedColumnsLocal.push('synchronized')
      this.displayedColumnsRemote.push('synchronized')
    }
    this.updateDisplayedColumns()
    this.openFolder(this.localStorage.getFolder(this.settings.openedFolder) || this.localStorage.local)
    
    this.localStorage.newFileNotifier.subscribe((value) => {
      this.openFolder(this.folder)
    })
  }

  ngOnInit() {
    this.remoteName = this.botStorage.id
    this.subs[this.subs.length] = this.settings.onChange.pipe(filter((props) => props.includes(EProperties.openedFolder))).subscribe(() => {
      this.openFolder(this.localStorage.getFolder(this.settings.openedFolder))
    })
    this.subs[this.subs.length] = this.media.asObservable().subscribe((changes: MediaChange[]) => {
      changes.forEach((change) => {
        if (change.mqAlias === 'xs') {
          this.sideNavMode = 'over'
        } else {
          this.sideNavMode = 'side'
        }
        this.isMobile = change.mqAlias === 'xs' || change.mqAlias === 'sm'
      })
      this.updateDisplayedColumns()
    })
  }

  ngOnDestroy() {
    this.docsSubject.complete()
    this.subs.forEach((s) => s.unsubscribe())
  }

  sortDocs(sort: Sort) {
    this.docsSource.sortDocs(sort)
  }

  setMenuDoc(doc: Doc) {
    this.menuDoc = doc
  }

  restore(doc: Doc): Promise<void> {
    return doc.move(this.localStorage.local).then(() => {
      this.docs = this.docs.filter((d: Doc) => d.signalingKey !== doc.signalingKey)
      this.docsSubject.next(this.docs)
    })
  }

  infoDoc() {
    this.rightSidenav.open()
  }

  delete(doc: Doc) {
    switch (this.folder) {
      case this.localStorage.local:
        this.moveToTrash(doc)
        break
      case this.localStorage.trash:
        this.docs = this.docs.filter((d: Doc) => d.signalingKey !== doc.signalingKey)
        this.docsSubject.next(this.docs)
        doc.delete().then(() => {
          this.snackBar.open(`"${doc.title}" has been deleted.`, 'close', {
            duration: 3000,
          })
        })
        break
      case this.localStorage.remote:
        const dialogRef = this.dialog.open(RemoteDeleteDialogComponent, {
          data: doc.title,
          width: '400px',
        })
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.docs = this.docs.filter((d: Doc) => d.signalingKey !== doc.signalingKey)
            this.docsSubject.next(this.docs)
            this.botStorage.remove(doc)
            this.snackBar.open(`"${this.settings.profile.login}" has been removed.`, 'Close', {
              duration: 5000,
            })
          }
        })
        break
    }
  }

  open(doc?: Doc) {
    if (this.folder !== this.localStorage.trash) {
      if (doc) {
        this.router.navigate(['/', doc.signalingKey])
      } else {
        this.router.navigate(['/', this.localStorage.generateSignalingKey()])
      }
    }
  }

  //FIXME -> When creating a file (with or without a name)
  //Renaming it using the pen button doesn't work -> files disappears.
  //When reloading the page, renaming works all the time as intended.
  rename(doc: Doc) {
    console.log("first pass here in docs.component.ts")
    const dialog = this.dialog.open(DocRenameDialogComponent, { data: doc })
    this.subs[this.subs.length] = dialog.afterClosed().subscribe(() => this.docsSource.sortDocs(this.docsSource.sort))
  }

  /**
   * Gets the url to access the document
   */
  share(doc: Doc) {
    this.clipboard.copy(window.location.origin + "/" + doc.signalingKey);
    this.snackBar.open(`Link copied to clipboard.`, 'Close', {
      duration: 5000,
    })
  }
  
  /**
   * Opens the current folder and lists documents
   */
  openFolder(folder: Folder) {
    this.folder = folder
    this.updateDisplayedColumns()
    this.isFinishOpen = false
    folder.fetchDocs().then((docs) => {
      this.docs = docs
      this.docsSubject.next(this.docs)
      this.isFinishOpen = true
    })
  }

  getDocLocationIcon(doc: Doc) {
    return this.localStorage.getFolder(doc.parentFolderId).icon
  }

  

  private moveToTrash(doc: Doc) {
    this.docs = this.docs.filter((d: Doc) => d.signalingKey !== doc.signalingKey)
    this.docsSubject.next(this.docs)
    doc.move(this.localStorage.trash).then(() => {
      this.snackBar
        .open(`"${doc.title}" moved to trash.`, 'Undo', {
          duration: 5000,
        })
        .onAction()
        .subscribe(() => {
          doc.move(this.localStorage.local).then(() => {
            this.docs[this.docs.length] = doc
            this.docsSubject.next(this.docs)
          })
        })
    })
  }

  private updateDisplayedColumns() {
    if (this.isMobile) {
      this.displayedColumns = ['title']
    } else {
      if (this.folder === this.localStorage.remote) {
        this.displayedColumns = this.displayedColumnsRemote
      } else {
        this.displayedColumns = this.displayedColumnsLocal
      }
    }
  }
}
