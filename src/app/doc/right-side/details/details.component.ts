import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'

import { ICollaborator } from '@coast-team/mute-core'

import { environment } from '@environments/environment'
import { EncryptionType } from '../../../core/crypto/EncryptionType.model'
import { Doc } from '../../../core/Doc'
import { UiService } from '../../../core/ui'
import { PulsarService, WebSocketReadyState } from '../../network'
import { RichCollaborator } from '../../rich-collaborators'

const defaultCollab = {
  avatar: '',
  displayName: '',
  login: '',
  deviceID: ''
}

interface Card {
  avatar: string
  displayName: string
  login: string
  deviceID: string
}

@Component({
  selector: 'mute-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('joinLeave', [
      state('active', style({ transform: 'translateX(0)' })),
      state('void', style({ transform: 'translateX(300px)' })),
      transition(':enter', animate('200ms ease-in')),
      transition(':leave', animate('200ms ease-out')),
    ]),
    trigger('cardState', [
      state('visible', style({ opacity: '1' })),
      state('void', style({ opacity: '0' })),
      transition('void => visible', animate('150ms ease-in')),
      transition('visible => void', animate('150ms ease-out')),
    ]),
  ],
})
export class DetailsComponent implements OnInit {
  @Input() doc: Doc
  @Input() collaborators: RichCollaborator[]

  public card: Card
  public cardState: string
  public crypto: [string, string]
  public hasConiks: boolean
  public hasKeyserver: boolean
  public logsTooltip: string
  public wsStateInfoToolTip: string
  public pulsarWsStateArray: string[] = ['', '', '', '']
  public pulsarWsLogsStateArray: string[] = ['', '']

  constructor (
    private cd: ChangeDetectorRef,
    public ui: UiService,
    private pulsarService: PulsarService
  ) {
    this.card = defaultCollab

    switch (environment.cryptography.type) {
      case EncryptionType.NONE:
        this.crypto = ['None', 'Only WebRTC native encryption']
        break
      case EncryptionType.METADATA:
        this.crypto = ['Metadata', 'Group key is shared through document metadata']
        break
      case EncryptionType.KEY_AGREEMENT_BD:
        this.crypto = ['Key agreement protocol', 'All members participate in group key creation']
        break
    }

    this.hasConiks = !!environment.cryptography.coniksClient
    this.hasKeyserver = !!environment.cryptography.keyserver

    this.logsTooltip =
      'By activating this button, you agree to share all the operations performed on the document.\n' +
      'The collected data is the information about the operations of the collaboration, which contains the contents of the document.\n'
    if (environment.logSystem.anonimyze) {
      this.logsTooltip += 'This content is anonymous, that is, it is replaced by random characters before being stored.\n'
    }
    this.logsTooltip += 'These logs will allow the realization of experimentation on the collaboration sessions.\n'

    this.wsStateInfoToolTip = 'Blue: Connecting\r\nGreen: Open\r\nYellow:Closing\r\nRed: Closed'
  }

  ngOnInit() {
    this.pulsarService.pulsarWebsockets$.subscribe((wsArray) => {
      this.pulsarWsStateArray = []
      for (const ws of wsArray.webSocketsArray) {
        switch (ws.readyState) {
          case WebSocketReadyState.OPEN:
            this.pulsarWsStateArray.push('green')
            break
          case WebSocketReadyState.CLOSING:
            this.pulsarWsStateArray.push('yellow')
            break
          case WebSocketReadyState.CLOSED:
            this.pulsarWsStateArray.push('red')
          case WebSocketReadyState.CONNECTING:
          default:
            this.pulsarWsStateArray.push('blue')
            break
        }
      }

      if (!this.cd['destroyed']) {
        this.cd.detectChanges()
      }
    })

    this.pulsarService.pulsarWebsocketsLogs$.subscribe((wsArrayLogs) => {
      this.pulsarWsLogsStateArray = []
      for (const ws of wsArrayLogs.webSocketsArray) {
        switch (ws.readyState) {
          case WebSocketReadyState.OPEN:
            this.pulsarWsLogsStateArray.push('green')
            break
          case WebSocketReadyState.CLOSING:
            this.pulsarWsLogsStateArray.push('yellow')
            break
          case WebSocketReadyState.CLOSED:
            this.pulsarWsLogsStateArray.push('red')
            break
          case WebSocketReadyState.CONNECTING:
          default:
            this.pulsarWsLogsStateArray.push('blue')
            break
        }
      }
      if (!this.cd['destroyed']) {
        this.cd.detectChanges()
      }
    })
  }

  showCard (collab: ICollaborator) {
    this.card = Object.assign({}, defaultCollab, collab)
    this.cardState = 'visible'
    this.cd.detectChanges()
  }

  hideCard () {
    this.cardState = 'void'
    this.cd.detectChanges()
  }

  updateShareLogs (event) {
    this.doc.shareLogs = event.checked
  }

  updatePulsar (event) {
    this.doc.pulsar = event.checked
  }
}
