import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { SignalingState, WebGroupState } from 'netflux'
import { Subscription } from 'rxjs'

import { NetworkService } from '../../network/network.service'

@Component({
  selector: 'mute-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss'],
  animations: [
    trigger('cardState', [
      state(
        'visible',
        style({
          opacity: '1',
        })
      ),
      transition('void => visible', animate('150ms ease-out')),
      transition('visible => void', animate('150ms ease-in')),
    ]),
  ],
})
export class SyncComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[]

  public SYNC = 1
  public SYNC_DISABLED = 2

  public syncState: number
  public cardState: string
  public signalingDetails: string
  public groupDetails: string

  constructor(private changeDetectorRef: ChangeDetectorRef, private networkService: NetworkService) {
    this.subscriptions = []
    this.groupDetails = ''
    this.signalingDetails = ''
  }

  ngOnInit() {
    this.subscriptions.push(
      this.networkService.onStateChange.subscribe((s: WebGroupState) => {
        switch (s) {
          case WebGroupState.JOINING:
            this.groupDetails = 'Joining the group...'
            this.syncState = undefined
            break
          case WebGroupState.JOINED:
            this.groupDetails = 'Joined the group'
            this.syncState = this.SYNC
            break
          case WebGroupState.LEFT:
            this.groupDetails = 'Left the group'
            this.syncState = this.SYNC_DISABLED
            break
          default:
            this.groupDetails = 'undefined'
            this.syncState = undefined
        }
        this.changeDetectorRef.detectChanges()
      })
    )

    this.subscriptions.push(
      this.networkService.onSignalingStateChange.subscribe((s: SignalingState) => {
        switch (s) {
          case SignalingState.CONNECTING:
            this.signalingDetails = 'Connecting to the signaling server...'
            break
          case SignalingState.OPEN:
            this.signalingDetails = 'Connected to the signaling server'
            break
          case SignalingState.CHECKING:
            this.signalingDetails = 'Checking group membership'
            break
          case SignalingState.CHECKED:
            this.signalingDetails = 'Signaling checked'
            break
          case SignalingState.CLOSED:
            this.signalingDetails = 'No longer connected to the signaling server'
            break
          default:
            this.signalingDetails = 'undefined'
        }
        this.changeDetectorRef.detectChanges()
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  showCard() {
    this.cardState = 'visible'
  }

  hideCard() {
    this.cardState = 'void'
  }
}
