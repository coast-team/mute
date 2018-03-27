import { DataSource } from '@angular/cdk/collections'
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { MatDialog, MatSidenav, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import { Doc } from '../core/Doc'
import { File } from '../core/File'
import { Folder } from '../core/Folder'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { UiService } from '../core/ui/ui.service'
import { DocRenameDialogComponent } from '../shared/doc-rename-dialog/doc-rename-dialog.component'

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
  public displayedColumns = ['title', 'key', 'created', 'opened', 'modified', 'synchronized']

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
    public localStorage: LocalStorageService,
    public ui: UiService,
    public media: ObservableMedia,
    public dialog: MatDialog
  ) {
    this.docsSubject = new BehaviorSubject([])
    this.docsSource = new DocsSource(this.docsSubject)
    this.title = ''
    this.subs = []
    this.openFolder(this.localStorage.lookupFolder(this.settings.openedFolder) || this.localStorage.local)
  }

  ngOnInit () {
    this.subs[this.subs.length] = this.settings.onChange
      .pipe(filter((props) => props.includes(EProperties.openedFolder)))
      .subscribe(() => {
        this.openFolder(this.localStorage.lookupFolder(this.settings.openedFolder))
      })
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
    this.localStorage.move(doc, this.localStorage.trash)
      .then(() => {
        this.snackBar.open(`"${doc.title}" moved to trash.`, 'Undo', {
          duration: 5000
        }).onAction().subscribe(() => {
          this.localStorage.move(doc, this.localStorage.local)
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
    return this.localStorage.move(doc, this.localStorage.local)
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
    this.localStorage.delete(doc)
      .then(() => {
        this.snackBar.open(`"${doc.title}" has been deleted.`, 'close', {
          duration: 3000
        })
      })
  }

  open (doc: Doc) {
    if (this.folder !== this.localStorage.trash) {
      this.router.navigate(['/', doc.key])
    }
  }

  rename (doc: Doc) {
    this.dialog.open(DocRenameDialogComponent, { data: doc })
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

  openFolder (folder: Folder) {
    this.folder = folder
    this.isFinishOpen = false
    this.localStorage.getDocs(folder)
      .then((docs) => {
        this.docs = docs
        this.docsSubject.next(this.docs)
        this.isFinishOpen = true
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
