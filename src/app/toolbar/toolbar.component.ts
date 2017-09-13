import { Component, OnInit, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core'
import { Observable, Subject, Subscription } from 'rxjs/Rx'
import { Router, NavigationStart, UrlSegment } from '@angular/router'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { WebGroupState, SignalingState } from 'netflux'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'
import { NetworkService } from '../doc/network/network.service'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input('state') state
  @ViewChild('inputPseudo') public inputPseudo: ElementRef
  @ViewChild('inputTitle') public inputTitle: ElementRef

  public SYNC = 1
  public SYNC_DISABLED = 2
  public SYNC_PROBLEM = 3
  public rootFileTitle: Observable<string>
  public routeName: string

  // Here add subscription
  public syncIcon: number
  public signalingStatus: boolean
  public onLineStatus: boolean
  public networkStatus: boolean

  constructor (
    public ui: UiService,
    private networkService: NetworkService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    public profile: ProfileService,
    public media: ObservableMedia
  ) {
    this.signalingStatus = undefined
    this.onLineStatus = undefined
    this.networkStatus = undefined

    this.rootFileTitle = this.ui.onActiveFile
      .filter((file) => file !== null)
      .pluck('title')
  }

  ngOnInit () {
    this.inputPseudo.nativeElement.value = this.profile.pseudonym
    this.networkService.onStateChange.subscribe((state: number) => {
      log.info('NetworkState', state)
      if (navigator.onLine) {
        if (state === WebGroupState.JOINED) {
          this.syncIcon = this.SYNC
        } else {
          this.syncIcon = undefined
        }
        this.changeDetectorRef.detectChanges()
      }
    })

    this.networkService.onSignalingStateChange.subscribe((state: number) => {
      log.info('SignalingState', state)
      if (navigator.onLine && this.syncIcon !== undefined && state !== SignalingState.READY_TO_JOIN_OTHERS) {
        this.syncIcon = undefined
        this.changeDetectorRef.detectChanges()
      }
    })

    this.networkService.onLine.subscribe((online: boolean) => {
      log.info('ONLINE/OFFLINE', 'Is online ' + online)
      if (!online) {
        this.syncIcon = this.SYNC_PROBLEM
        this.changeDetectorRef.detectChanges()
      }
    })

    this.router.events
      .filter((event) => event instanceof NavigationStart)
      .subscribe((event: NavigationStart) => {
        this.routeName = this.routeNameFromUrl(event.url)
        this.changeDetectorRef.detectChanges()
      })

  }

  updatePseudo (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.inputPseudo.nativeElement.blur()
    } else if (event.type === 'blur') {
      const newPseudo = this.inputPseudo.nativeElement.value
      if (this.profile.pseudonym !== newPseudo) {
        this.profile.pseudonym = (newPseudo === '') ?
          this.profile.pseudonymDefault : newPseudo
      }
    }
  }

  selectPseudo () {
    this.inputPseudo.nativeElement.select()
  }

  updateTitle (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.inputTitle.nativeElement.blur()
    } else if (event.type === 'blur') {
      const doc = this.ui.activeFile as any
      const newTitle = this.inputTitle.nativeElement.value
      if (doc.title !== newTitle) {
        if (newTitle === '') {
          doc.title = 'Untitled document'
          this.inputTitle.nativeElement.value = doc.title
        } else {
          doc.title = newTitle
        }
        doc.save()
      }
    }
  }

  selectTitle () {
    this.inputTitle.nativeElement.select()
  }

  private routeNameFromUrl (url: string) {
    if (url.includes('/docs')) {
      return 'docs'
    } else if (url.includes('/doc/') && !url.includes('/history/')) {
      return 'doc'
    } else if (url.includes('history')) {
      return 'history'
    }
  }

}
