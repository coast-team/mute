import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, Subscription } from 'rxjs/Rx'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'

import { BotTuple, FakeStorageService, LocalStorageService, BotStorageService } from '../core/storage'
import { Folder } from '../core/Folder'
import { UiService } from '../core/ui/ui.service'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  private botStorageSubs: Subscription

  public allDocuments: Folder
  public local: Folder
  public botFoldersSubject: BehaviorSubject<Folder[]>
  public trash: Folder
  public activeFolder: Folder

  constructor (
    public router: Router,
    public fakeStorage: FakeStorageService,
    public localStorage: LocalStorageService,
    public botStorage: BotStorageService,
    public ui: UiService,
    public media: ObservableMedia
  ) {
    this.allDocuments = this.fakeStorage.allDocs
    this.botFoldersSubject = new BehaviorSubject([])
    this.local = this.localStorage.home
    this.trash = this.localStorage.trash
    switch (this.router.url) {
    case `/docs/${this.allDocuments.id}`:
      this.activeFolder = this.allDocuments
      break
    case `/docs/${this.local.id}`:
      this.activeFolder = this.local
      break
    case `/docs/${this.trash.id}`:
      this.activeFolder = this.trash
      break
    }
  }

  ngOnInit () {
    this.botStorageSubs = this.botStorage.onBots
      .subscribe((bots: BotTuple[]) => {
        const botsFolders = bots.map((botTuple) => botTuple[1])
        botsFolders.forEach((botFolder: Folder) => {
          if (this.router.url === `/docs/${botFolder.id}`) {
            this.activeFolder = botFolder
            this.ui.setActiveFile(botFolder)
          }
        })
        this.botFoldersSubject.next(botsFolders)
      })
    if (this.activeFolder) {
      this.ui.setActiveFile(this.activeFolder)
    }
  }

  ngOnDestroy () {
    this.botStorageSubs.unsubscribe()
  }

  newDoc () {
    const doc = this.localStorage.createDoc()
    this.ui.setActiveFile(doc)
    this.router.navigate(['/doc', doc.id])
  }

  setActiveFile ({value}) {
    this.ui.setActiveFile(value)
  }

  onStorageClick () {
    if (this.media.isActive('xs')) {
      this.ui.toggleNav()
    }
  }
}
