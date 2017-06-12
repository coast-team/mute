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
    public media: ObservableMedia
  ) {
    this.snackBarSubject = new Subject()
    this.docs = []
    this.visibleBtns = []
  }

  ngOnInit () {
    log.angular('DocsComponent init')

    this.mediaSubscription = this.media.subscribe((change: MediaChange) => {
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

    const parent = this

    if ('serviceWorker' in navigator) {
      // Delay registration until after the page has loaded, to ensure that our
      // precaching requests don't degrade the first visit experience.
      // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
      window.addEventListener('load', function () {
        // Your service-worker.js *must* be located at the top-level directory relative to your site.
        // It won't be able to control pages unless it's located at the same level or higher than them.
        // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
        // See https://github.com/slightlyoff/ServiceWorker/issues/468
        navigator.serviceWorker.register('service-worker.js').then(function (reg) {
          // updatefound is fired if service-worker.js changes.
          reg.onupdatefound = function () {
            // The updatefound event implies that reg.installing is set; see
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            let installingWorker = reg.installing


            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                    // At this point, the old content will have been purged and the fresh content will
                    // have been added to the cache.
                    // It's the perfect time to display a "New content is available; please refresh."
                    // message in the page's interface.
                  parent.snackBarSubject.next('Updated application is available, refresh your browser!')
                  console.log('New or updated content is available.')
                } else {
                    // At this point, everything has been precached.
                    // It's the perfect time to display a "Content is cached for offline use." message.
                  parent.snackBarSubject.next('Content available offline')
                  console.log('Content is now available offline!')
                }
                break
              case 'redundant':
                console.error('The installing service worker became redundant.')
                break
              }
            }
          }
        })
        .catch(function (e) {
          console.error('Error during service worker registration:', e)
        })
      })
    }


  }

  ngOnDestroy () {
    this.snackBarSubject.complete()
    this.activeFileSubs.unsubscribe()
    this.mediaSubscription.unsubscribe()
  }

  deleteAllDocs (): void {
    const snackMsg = (this.activeFolder.id !== 'trash') ?
      'All documents moved to tash' : 'All documents deleted'
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

}
