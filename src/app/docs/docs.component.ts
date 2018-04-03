import { DataSource } from '@angular/cdk/collections'
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { MatDialog, MatSidenav, MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import { Doc } from '../core/Doc'
import { Folder } from '../core/Folder'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { UiService } from '../core/ui/ui.service'
import { DocRenameDialogComponent } from '../shared/doc-rename-dialog/doc-rename-dialog.component'
import { RemoteDeleteDialogComponent } from '../shared/remote-delete-dialog/remote-delete-dialog.component'

class DocsSource extends DataSource<any> {
  constructor(private docs: Subject<Doc[]>) {
    super()
  }
  connect(): Observable<Doc[]> {
    return this.docs
  }
  disconnect() {}
}

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss'],
})
export class DocsComponent implements OnDestroy, OnInit {
  @ViewChild('leftSidenav') leftSidenav: MatSidenav
  @ViewChild('rightSidenav') rightSidenav

  private subs: Subscription[]
  private displayedColumnsLocal = ['title', 'key', 'created', 'opened', 'modified']
  private displayedColumnsRemote = ['title', 'location', 'key', 'created', 'opened', 'modified']
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

  public actions

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private botStorage: BotStorageService,
    private settings: SettingsService,
    public localStorage: LocalStorageService,
    public ui: UiService,
    public media: ObservableMedia,
    public dialog: MatDialog
  ) {
    this.docsSubject = new BehaviorSubject([])
    this.docsSource = new DocsSource(this.docsSubject)
    this.title = ''
    this.subs = []
    if (this.botStorage.remote) {
      this.displayedColumnsLocal.push('synchronized')
      this.displayedColumnsRemote.push('synchronized')
    }
    this.setDisplayedColumns()
    this.openFolder(this.localStorage.lookupFolder(this.settings.openedFolder) || this.localStorage.local)
  }

  ngOnInit() {
    this.remoteName = this.botStorage.id
    this.subs[this.subs.length] = this.settings.onChange.pipe(filter((props) => props.includes(EProperties.openedFolder))).subscribe(() => {
      this.openFolder(this.localStorage.lookupFolder(this.settings.openedFolder))
    })
    this.subs[this.subs.length] = this.media.asObservable().subscribe((change: MediaChange) => {
      if (change.mqAlias === 'xs') {
        this.sideNavMode = 'over'
      }
      this.isMobile = change.mqAlias === 'xs' || change.mqAlias === 'sm'
      if (this.isMobile) {
        this.displayedColumns = ['title']
      }
    })
  }

  ngOnDestroy() {
    this.docsSubject.complete()
    this.subs.forEach((s) => s.unsubscribe())
  }

  setMenuDoc(doc: Doc) {
    this.menuDoc = doc
  }

  restore(doc: Doc): Promise<void> {
    return this.localStorage.move(doc, this.localStorage.local).then(() => {
      this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
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
        this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
        this.docsSubject.next(this.docs)
        this.localStorage.delete(doc).then(() => {
          this.snackBar.open(`"${doc.title}" has been deleted.`, 'close', {
            duration: 3000,
          })
        })
        break
      case this.botStorage.remote:
        const dialogRef = this.dialog.open(RemoteDeleteDialogComponent, {
          data: doc.title,
          width: '400px',
        })
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
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

  open(doc: Doc) {
    if (this.folder !== this.localStorage.trash) {
      this.router.navigate(['/', doc.key])
    }
  }

  rename(doc: Doc) {
    this.dialog.open(DocRenameDialogComponent, { data: doc })
  }

  share(doc: Doc) {
    // Workaround, but not pretty
    const aux = document.createElement('input')
    aux.setAttribute('value', `${window.location.origin}/${doc.key}`)
    document.body.appendChild(aux)
    aux.select()
    document.execCommand('copy')
    document.body.removeChild(aux)
    this.snackBar.open(`Link copied to clipboard.`, 'Close', {
      duration: 5000,
    })
  }

  openFolder(folder: Folder) {
    this.folder = folder
    this.setDisplayedColumns()
    this.isFinishOpen = false
    this.localStorage.getDocs(folder).then((docs) => {
      this.docs = docs
      this.docsSubject.next(this.docs)
      this.isFinishOpen = true
    })
  }

  getDocLocationIcon(doc: Doc) {
    return this.localStorage.lookupFolder(doc.parentFolderId).icon
  }

  private moveToTrash(doc: Doc) {
    this.docs = this.docs.filter((d: Doc) => d.key !== doc.key)
    this.docsSubject.next(this.docs)
    this.localStorage.move(doc, this.localStorage.trash).then(() => {
      this.snackBar
        .open(`"${doc.title}" moved to trash.`, 'Undo', {
          duration: 5000,
        })
        .onAction()
        .subscribe(() => {
          this.localStorage.move(doc, this.localStorage.local).then(() => {
            this.docs[this.docs.length] = doc
            this.docsSubject.next(this.docs)
          })
        })
    })
  }

  private setDisplayedColumns() {
    if (this.folder === this.botStorage.remote) {
      this.displayedColumns = this.displayedColumnsRemote
    } else {
      this.displayedColumns = this.displayedColumnsLocal
    }
  }
}
