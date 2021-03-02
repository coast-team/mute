import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { ICollaborator } from '@coast-team/mute-core'

import { environment } from '../../../../environments/environment'
import { EncryptionType } from '../../../core/crypto/EncryptionType'
import { Doc } from '../../../core/Doc'
import { UiService } from '../../../core/ui/ui.service'
import { PulsarService } from '../../network/pulsar.service'
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
  public coniks: boolean
  public keyserver: boolean
  public logsTooltip: string
  public wsStateInfoToolTip: string
  public pulsarWsStateArray: string[] = ['', '', '', '']
  public pulsarWsLogsStateArray: string[] = ['', '']

  ngOnInit() {
    this.pulsarService.pulsarWebsockets$.subscribe((wsArray) => {
      this.pulsarWsStateArray = []
      for (const ws of wsArray.webSocketsArray) {
        switch (ws.readyState) {
          case 0:
            this.pulsarWsStateArray.push('blue')
            break
          case 1:
            this.pulsarWsStateArray.push('green')
            break
          case 2:
            this.pulsarWsStateArray.push('yellow')
            break
          case 3:
            this.pulsarWsStateArray.push('red')
            break
          default:
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
          case 0:
            this.pulsarWsLogsStateArray.push('blue')
            break
          case 1:
            this.pulsarWsLogsStateArray.push('green')
            break
          case 2:
            this.pulsarWsLogsStateArray.push('yellow')
            break
          case 3:
            this.pulsarWsLogsStateArray.push('red')
            break
          default:
            break
        }
      }
      if (!this.cd['destroyed']) {
        this.cd.detectChanges()
      }
    })
  }

  constructor (private cd: ChangeDetectorRef, public ui: UiService, private pulsarService: PulsarService) {
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
    this.coniks = !!environment.cryptography.coniksClient
    this.keyserver = !!environment.cryptography.keyserver

    this.logsTooltip =
      'By activating this button, you agree to share all the operations performed on the document.\n' +
      'The collected data is the information about the operations of the collaboration, which contains the contents of the document.\n'
    if (environment.logSystem.anonimyze) {
      this.logsTooltip += 'This content is anonymous, that is, it is replaced by random characters before being stored.\n'
    }
    this.logsTooltip += 'These logs will allow the realization of experimentation on the collaboration sessions.\n'

    this.wsStateInfoToolTip = 'Blue: Connecting\r\nGreen: Open\r\nYellow:Closing\r\nRed: Closed'
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
