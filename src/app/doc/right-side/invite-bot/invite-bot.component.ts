import {
  Component,
  Injectable,
  OnInit,
  ViewChild } from '@angular/core'
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'

import { NetworkService } from '../../../doc/network/network.service'
import { BotStorageService, BotTuple } from '../../../core/storage/bot-storage/bot-storage.service'
import { BotInfo } from '../../../core/storage/bot-storage/BotInfo'

@Component({
  selector: 'mute-invite-bot',
  templateUrl: './invite-bot.component.html',
  styleUrls: ['./invite-bot.component.scss'],
  animations: [
    trigger('btnState', [
      state('active', style({transform: 'scale(1)'})),
      state('void', style({transform: 'scale(0)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ]),
    trigger('inputState', [
      state('active', style({transform: 'translateX(0)'})),
      state('void', style({transform: 'translateX(100%)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ])
  ]
})

@Injectable()
export class InviteBotComponent implements OnInit {

  private regexHostName = '^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])(\:[0-9]{1,5})?$'
  private regexIP = '^(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])' +
                    '(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}(\:[0-9]{1,5})?$'

  @ViewChild('ipElm') ipElm
  public btnActive = true
  public inputActive = false
  public error = false
  public errorMessage = 'Invalid ip address or host name'
  public bots: BotInfo[]

  constructor (
    private network: NetworkService,
    private botStorage: BotStorageService
  ) {
    this.bots = []
  }

  ngOnInit () {
    this.botStorage.onBots.subscribe((bots: BotTuple[]) => {
      bots.forEach((bot: BotTuple) => {
        this.bots.push(bot[0])
      })
    })
  }

  btnStateDone (event) {
    if (event.toState === 'void') {
      this.inputActive = true
    }
  }

  inputStateDone (event) {
    if (event.toState === 'void') {
      this.btnActive = true
    } else if (event.toState === 'active') {
      this.ipElm.nativeElement.focus()
    }
  }

  validate (event) {
    if (this.ipElm.nativeElement.value.match(`${this.regexIP}|${this.regexHostName}`)) {
      this.error = false
    } else {
      this.error = true
    }
  }

  showInput () {
    this.btnActive = false
  }

  ok () {
    if (!this.error) {
      this.network.inviteBot(this.ipElm.nativeElement.value)
    }
    this.inputActive = false
  }

  cancel () {
    this.inputActive = false
  }

  inviteBot (url: string) {
    this.network.inviteBot(url)
  }

}
