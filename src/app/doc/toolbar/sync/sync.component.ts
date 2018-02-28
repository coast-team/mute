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

import { NetworkService } from '../../../doc/network/network.service'

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
    this.subs[this.subs.length] = this.networkService.onStateChange.subscribe((groupState: WebGroupState) => {
      this.groupState = groupState
      this.setGroupDetails()
      switch (groupState) {
      case WebGroupState.JOINING:
        this.syncState = undefined
        break
      case WebGroupState.JOINED:
        this.syncState = this.SYNC
        break
      case WebGroupState.LEFT:
        this.syncState = this.SYNC_DISABLED
        break
      default:
        this.syncState = undefined
      }
      this.setSyncDetails()
      this.changeDetectorRef.detectChanges()
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
    case SignalingState.CONNECTED:
      this.signalingDetails = 'connected to one member'
      break
    case SignalingState.STABLE:
      this.signalingDetails = 'ready to join others'
      break
    case SignalingState.CLOSED:
      this.signalingDetails = 'closed'
      break
    default:
      this.signalingDetails = 'undefined'
    }
  }

}
