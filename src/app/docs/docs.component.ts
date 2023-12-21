import { DataSource } from '@angular/cdk/table'
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { MatDialog } from '@angular/material/dialog'
import { MatSidenav } from '@angular/material/sidenav'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Sort } from '@angular/material/sort'
import { Router } from '@angular/router'
import { Clipboard } from '@angular/cdk/clipboard'

import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { Doc } from '@app/core/Doc'
import { Folder } from '@app/core/Folder'
import { EProperties } from '@app/core/settings/EProperties.enum'
import { SettingsService } from '@app/core/settings'
import { BotStorageService, LocalStorageService } from '@app/core/storage'
import { UiService } from '@app/core/ui'
import { DocRenameDialogComponent, RemoteDeleteDialogComponent } from '../shared/dialogs'
import { MatMenuTrigger } from '@angular/material/menu'

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
  @ViewChild('leftSidenav', { static: true }) leftSidenav: MatSidenav
  @ViewChild('rightSidenav', { static: true }) rightSidenav: MatSidenav
  @ViewChild('rightClickTrigger') rightClickTrigger: MatMenuTrigger

  public folder: Folder
  public title: string
  public displayedColumns: string[]
  public docsSubject: BehaviorSubject<Doc[]>
  public docsSource: DocsSource
  public docs: Doc[]
  public sideNavMode = 'side'
  public isFinishOpen: boolean
  public menuDoc: Doc
  public remoteName: string
  public remoteId: string
  public sortDefault: Sort = { active: 'modified', direction: 'desc' }
  public menuTopLeftPosition = { x: '0', y: '0' }
  public actions
  public breakpointsXS = Breakpoints.XSmall

  private subs: Subscription[]
  private displayedColumnsMobile = ['title', 'more']
  private displayedColumnsLocal = ['title', 'created', 'opened', 'modified', 'more']
  private displayedColumnsRemote = ['title', 'location', 'created', 'opened', 'modified', 'more']

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private botStorage: BotStorageService,
    private settings: SettingsService,
    private clipboard: Clipboard,
    public localStorage: LocalStorageService,
    public ui: UiService,
    public breakpointObserver: BreakpointObserver,
    public dialog: MatDialog
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
    this.openFolder(this.localStorage.getFolder(this.settings.openedFolder) || this.localStorage.local)
  }

  ngOnInit() {
    this.remoteName = this.botStorage.id
    this.subs[this.subs.length] = this.settings.onChange.pipe(filter((props) => props.includes(EProperties.openedFolder))).subscribe(() => {
      this.openFolder(this.localStorage.getFolder(this.settings.openedFolder))
    })
    this.subs[this.subs.length] = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      if (result.breakpoints[Breakpoints.XSmall]) {
        this.sideNavMode = 'over'
      } else {
        this.sideNavMode = 'side'
      }
      this.updateDisplayedColumns()
    })
    this.subs[this.subs.length] = this.leftSidenav.closedStart.subscribe(() => {
      this.updateDisplayedColumns()
    })
    this.subs[this.subs.length] = this.leftSidenav.openedStart.subscribe(() => {
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

  open(doc?: Doc, newTab?: boolean) {
    const key = doc ? doc.signalingKey : this.localStorage.generateSignalingKey()

    if (newTab) {
      window.open(`${window.location.origin}/${key}`, '_blank')
    } else {
      this.router.navigate(['/', key])
    }
  }

  rename(doc: Doc) {
    const dialog = this.dialog.open(DocRenameDialogComponent, { data: doc })
    this.subs[this.subs.length] = dialog.afterClosed().subscribe(() => this.docsSource.sortDocs(this.docsSource.sort))
  }

  share(doc: Doc) {
    this.clipboard.copy(`${window.location.origin}/${doc.signalingKey}`)
    this.snackBar.open(`Link copied to clipboard.`, 'Close', {
      duration: 5000,
    })
  }

  openFolder(folder: Folder) {
    this.folder = folder
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

  /**
   * Method called when the user click with the right button
   * @param event MouseEvent, it contains the coordinates
   * @param item Our data contained in the row of the table
   */
  public onRightClick(event: MouseEvent, item: any): void {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault()

    // we record the mouse position in our object
    this.menuTopLeftPosition.x = event.clientX + 'px'
    this.menuTopLeftPosition.y = event.clientY + 'px'

    // we pass to the menu the information about our object
    this.rightClickTrigger.menuData = { item }
    this.setMenuDoc(item)

    // we open the menu
    this.rightClickTrigger.menu.focusFirstItem('mouse')
    this.rightClickTrigger.openMenu()
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
    if (
      this.breakpointObserver.isMatched(Breakpoints.XSmall) ||
      ((this.breakpointObserver.isMatched(Breakpoints.XSmall) || this.breakpointObserver.isMatched(Breakpoints.Small)) &&
        this.leftSidenav.opened)
    ) {
      this.displayedColumns = this.displayedColumnsMobile
    } else {
      if (this.folder === this.localStorage.remote) {
        this.displayedColumns = this.displayedColumnsRemote
      } else {
        this.displayedColumns = this.displayedColumnsLocal
      }
    }
  }
}
