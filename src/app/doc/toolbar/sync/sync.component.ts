import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import {
  NetworkServiceAbstracted,
  PeersGroupConnectionStatus,
  SignalingServerConnectionStatus,
} from '@app/doc/network/network.service.abstracted'

enum SyncState {
  UNDEFINED,
  ENABLED,
  DISABLED,
}

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
  public syncState = SyncState
  public syncStateValue = SyncState.UNDEFINED
  public cardState: string
  public groupDetails: string
  public serverDetails: string

  public networkUseGroup: boolean
  public networkUseServer: boolean

  private subscriptions: Subscription[]

  constructor(private changeDetectorRef: ChangeDetectorRef, private networkService: NetworkServiceAbstracted) {
    this.subscriptions = []
    this.groupDetails = ''
    this.serverDetails = ''
    this.networkUseGroup = networkService.solution.USE_GROUP
    this.networkUseServer = networkService.solution.USE_SERVER
  }

  ngOnInit() {
    //Handling the status of connection to the group of peers
    this.subscriptions.push(
      this.networkService.onPeersGroupConnectionStatusChange.subscribe((status: PeersGroupConnectionStatus) => {
        switch (status) {
          case PeersGroupConnectionStatus.JOINING:
            this.groupDetails = 'Trying to join the group...'
            this.syncStateValue = SyncState.UNDEFINED
            break
          case PeersGroupConnectionStatus.JOINED:
            this.groupDetails = 'Joined the group'
            this.syncStateValue = SyncState.ENABLED
            break
          case PeersGroupConnectionStatus.OFFLINE:
            this.groupDetails = 'Not connected to the group'
            this.syncStateValue = SyncState.DISABLED
            break
          default:
            this.groupDetails = 'Not connected to the group'
            this.syncStateValue = SyncState.UNDEFINED
        }
        this.changeDetectorRef.detectChanges()
      })
    )

    // Handling the status of connection to the signaling server, message queue...
    this.subscriptions.push(
      this.networkService.onSignalingServerConnectionStatusChange.subscribe((status: SignalingServerConnectionStatus) => {
        switch (status) {
          case SignalingServerConnectionStatus.CONNECTING:
            this.serverDetails = 'Connecting to the signaling server... '
            break
          case SignalingServerConnectionStatus.OPEN:
            this.serverDetails = 'Connected to the signaling server'
            break
          case SignalingServerConnectionStatus.CHECKING:
            this.serverDetails = 'Checking group membership'
            break
          case SignalingServerConnectionStatus.CHECKED:
            this.serverDetails = 'Signaling checked'
            break
          case SignalingServerConnectionStatus.CLOSED:
            this.serverDetails = 'No longer connected to the signaling server'
            break
          default:
            this.serverDetails = 'undefined'
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
