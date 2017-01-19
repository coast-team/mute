import {
  Component,
  Injectable,
  OnInit,
  ViewChild,
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/core'

import { NetworkService } from 'doc/network/network.service'

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

  private network: NetworkService

  @ViewChild('ipElm') ipElm
  public btnActive: boolean = true
  public inputActive: boolean = false
  public error: boolean = false
  public errorMessage: string = 'Invalid ip address or host name'

  constructor (network: NetworkService) {
    this.network = network
  }

  ngOnInit () { }

  btnStateDone (event) {
    if (event.toState === 'void') {
      this.inputActive = true
    }
  }

  inputStateDone (event) {
    if (event.toState === 'void') {
      this.btnActive = true
    } else if (event.toState === 'active') {
      this.ipElm.focus()
    }
  }

  validate () {
    log.debug('Event: ', this.ipElm.value)
    if (this.ipElm.value.match(`${this.regexIP}|${this.regexHostName}`)) {
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
      this.network.inviteBot(this.ipElm.value)
    }
    this.inputActive = false
  }

  cancel () {
    this.inputActive = false
  }

}
