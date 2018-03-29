import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, Injectable } from '@angular/core'

import { BotStorageService } from '../../../core/storage/bot/bot-storage.service'
import { NetworkService } from '../../../doc/network/network.service'

@Component({
  selector: 'mute-invite-bot',
  templateUrl: './invite-bot.component.html',
  styleUrls: ['./invite-bot.component.scss'],
  animations: [
    trigger('btnState', [
      state('active', style({ transform: 'scale(1)' })),
      state('void', style({ transform: 'scale(0)' })),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out')),
    ]),
    trigger('inputState', [
      state('active', style({ transform: 'translateX(0)' })),
      state('void', style({ transform: 'translateX(100%)' })),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out')),
    ]),
  ],
})
@Injectable()
export class InviteBotComponent {
  public disabled: boolean

  constructor(private network: NetworkService, public botStorage: BotStorageService) {
    this.disabled = true
    botStorage.onStatus.subscribe((code) => (this.disabled = code !== BotStorageService.AVAILABLE))
  }

  inviteBot() {
    this.network.inviteBot(this.botStorage.wsURL)
  }
}
