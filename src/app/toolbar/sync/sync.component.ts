import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations'
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { SignalingState, WebGroupState } from 'netflux'
import { Subscription } from 'rxjs/Subscription'

import { NetworkService } from '../../doc/network/network.service'

@Component({
  selector: 'mute-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss'],
  animations: [
    trigger('cardState', [
      state('visible', style({
        opacity: '1'
      })),
      transition('void => visible', animate('150ms ease-out')),
      transition('visible => void', animate('150ms ease-in'))
    ])
  ]
})
export class SyncComponent implements OnInit, OnDestroy {

  private subs: Subscription[]

  public SYNC = 1
  public SYNC_DISABLED = 2
  public SYNC_PROBLEM = 3

  public cardState: string
  public syncDetails: string
  public syncState: number
  public signalingState: SignalingState
  public signalingDetails: string
  public groupState: WebGroupState
  public groupDetails: string

  constructor (
    private changeDetectorRef: ChangeDetectorRef,
    private networkService: NetworkService
  ) {
    this.subs = []
    this.signalingState = undefined
    this.groupState = undefined
    this.setSyncDetails()
    this.setSignalingDetails()
    this.setGroupDetails()
  }

  ngOnInit () {
    this.subs[this.subs.length] = this.networkService.onStateChange.subscribe((state: WebGroupState) => {
      this.groupState = state
      this.setGroupDetails()
      if (global.window.navigator.onLine) {
        if (state === WebGroupState.JOINED) {
          this.syncState = this.SYNC
        } else {
          this.syncState = undefined
        }
        this.setSyncDetails()
        this.changeDetectorRef.detectChanges()
      }
    })

    this.subs[this.subs.length] = this.networkService.onSignalingStateChange.subscribe((state: SignalingState) => {
      this.signalingState = state
      this.setSignalingDetails()
      if (global.window.navigator.onLine && this.syncState !== undefined && state !== SignalingState.READY_TO_JOIN_OTHERS) {
        this.syncState = undefined
        this.setSyncDetails()
        this.changeDetectorRef.detectChanges()
      }
    })

    this.subs[this.subs.length] = this.networkService.onLine.subscribe((online: boolean) => {
      if (!online) {
        this.syncState = this.SYNC_PROBLEM
        this.setSyncDetails()
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  ngOnDestroy () {
    this.subs.forEach((s: Subscription) => s.unsubscribe())
  }

  showCard () {
    this.cardState = 'visible'
  }

  hideCard () {
    this.cardState = 'void'
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
      this.groupDetails = 'joined'
      break
    case WebGroupState.LEFT:
      this.groupDetails = 'alone'
      break
    default:
      this.groupDetails = 'undefined'
    }
  }

  private setSignalingDetails () {
    switch (this.signalingState) {
    case SignalingState.CONNECTING:
      this.signalingDetails = 'connecting...'
      break
    case SignalingState.OPEN:
      this.signalingDetails = 'connected'
      break
    case SignalingState.CONNECTED_WITH_FIRST_MEMBER:
      this.signalingDetails = 'connected & start joining...'
      break
    case SignalingState.READY_TO_JOIN_OTHERS:
      this.signalingDetails = 'connected & ready'
      break
    case SignalingState.CLOSED:
      this.signalingDetails = 'closed'
      break
    default:
      this.signalingDetails = 'undefined'
    }
  }

}
