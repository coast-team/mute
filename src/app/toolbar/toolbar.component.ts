import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations'
import {  Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'
import { ResolveEnd, Router } from '@angular/router'
import { SignalingState, WebGroupState } from 'netflux'

import { ProfileService } from '../core/profile/profile.service'
import { StorageService } from '../core/storage/storage.service'
import { UiService } from '../core/ui/ui.service'
import { WindowRefService } from '../core/WindowRefService'
import { NetworkService } from '../doc/network/network.service'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  animations: [
    trigger('syncDetails', [
      state('hidden', style({
        transform: 'scale(0)'
      })),
      state('visible',   style({
        transform: 'scale(1)'
      })),
      transition('void <=> *', animate('0ms')),
      transition('hidden <=> visible', animate('150ms ease-out')),
    ]),
  ],
})
export class ToolbarComponent implements OnInit {

  @Input('state') state
  @ViewChild('inputPseudo') public inputPseudo: ElementRef
  @ViewChild('inputTitle') public inputTitle: ElementRef

  public SYNC = 1
  public SYNC_DISABLED = 2
  public SYNC_PROBLEM = 3
  public rootFileTitle: string
  public routeName: string

  // Here add subscription
  public syncDetailsState = 'hidden'
  public syncDetails: string
  public syncState: number
  public signalingState: SignalingState
  public signalingDetails: string
  public groupState: WebGroupState
  public groupDetails: string

  constructor (
    public ui: UiService,
    private networkService: NetworkService,
    private windowRef: WindowRefService,
    private router: Router,
    private storage: StorageService,
    public profile: ProfileService,
    public media: ObservableMedia,
  ) {
    this.signalingState = undefined
    this.groupState = undefined
    this.rootFileTitle = ''
    this.setSyncDetails()
    this.setSignalingDetails()
    this.setGroupDetails()

    this.networkService.onStateChange.subscribe((state: WebGroupState) => {
      this.groupState = state
      this.setGroupDetails()
      if (this.windowRef.window.navigator.onLine) {
        if (state === WebGroupState.JOINED) {
          this.syncState = this.SYNC
        } else {
          this.syncState = undefined
        }
        this.setSyncDetails()
      }
    })

    this.networkService.onSignalingStateChange.subscribe((state: SignalingState) => {
      this.signalingState = state
      this.setSignalingDetails()
      if (this.windowRef.window.navigator.onLine && this.syncState !== undefined && state !== SignalingState.READY_TO_JOIN_OTHERS) {
        this.syncState = undefined
        this.setSyncDetails()
      }
    })

    this.networkService.onLine.subscribe((online: boolean) => {
      if (!online) {
        this.syncState = this.SYNC_PROBLEM
        this.setSyncDetails()
      }
    })
  }

  ngOnInit () {

    this.inputPseudo.nativeElement.value = this.profile.pseudonym

    this.router.events
      .filter((event) => event instanceof ResolveEnd)
      .subscribe((event: ResolveEnd) => {
        this.routeName = this.routeNameFromUrl(event.url)
        this.rootFileTitle = this.ui.activeFile.title
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
        this.storage.updateFile(doc)
      }
    }
  }

  selectTitle () {
    this.inputTitle.nativeElement.select()
  }

  showSyncDetails () {
    this.syncDetailsState = 'visible'
  }

  hideSyncDetails () {
    this.syncDetailsState = 'hidden'
  }

  private setSyncDetails () {
    switch (this.syncState) {
    case this.SYNC:
      this.syncDetails = 'Synchronized'
      break
    case this.SYNC_DISABLED:
      this.syncDetails = 'Synchronization disabled'
      break
    case this.SYNC_PROBLEM:
      this.syncDetails = 'No network connectivity!'
      break
    default:
      this.syncDetails = 'Synchronizing...'
    }
  }

  private setGroupDetails () {
    switch (this.groupState) {
    case WebGroupState.JOINING:
      this.groupDetails = 'joining...'
      break
    case WebGroupState.JOINED:
      this.groupDetails = 'joined.'
      break
    case WebGroupState.LEFT:
      this.groupDetails = 'alone.'
      break
    default:
      this.groupDetails = 'undefined.'
    }
  }

  private setSignalingDetails () {
    switch (this.signalingState) {
    case SignalingState.CONNECTING:
      this.signalingDetails = 'connecting...'
      break
    case SignalingState.OPEN:
      this.signalingDetails = 'connected.'
      break
    case SignalingState.CONNECTED_WITH_FIRST_MEMBER:
      this.signalingDetails = 'connected & start joining...'
      break
    case SignalingState.READY_TO_JOIN_OTHERS:
      this.signalingDetails = 'connected & ready to join others.'
      break
    case SignalingState.CLOSED:
      this.signalingDetails = 'closed.'
      break
    default:
      this.signalingDetails = 'undefined.'
    }
  }

  private routeNameFromUrl (url: string) {
    if (['/', '/trash'].includes(url)) {
      return 'docs'
    } else if (url.startsWith('/history')) {
      return 'history'
    } else {
      return 'doc'
    }
  }
}
