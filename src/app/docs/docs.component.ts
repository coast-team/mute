import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { BotStorageService } from '../core/bot-storage/bot-storage.service'
import { environment } from '../../environments/environment'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit {

  private router: Router
  private botStorageService: BotStorageService
  private currentBot: {url: string, key: string} = {url: null, key: null}
  private botIP: string = '192.168.0.100:8000'
  private docs: Array<Object> = []
  private hasDocumens: boolean

  constructor (router: Router, botStorageService: BotStorageService) {
    this.router = router
    this.botStorageService = botStorageService
  }

  ngOnInit () {
    this.botStorageService.reachable(environment.botStorageURL)
      .then(() => {
        this.hasDocumens = true
        this.botStorageService.getDocuments(environment.botStorageURL)
          .then((docs: any) => {
            this.docs = docs
          })
      })
      .catch(() => {
        this.hasDocumens = false
      })
  }

  setBotStorage (key: string) {
    this.currentBot.url = environment.botStorageURL
    this.currentBot.key = key
  }

  newDoc () {
    const MIN_LENGTH = 10
    const DELTA_LENGTH = 0
    const MASK = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    const length = MIN_LENGTH + Math.round(Math.random() * DELTA_LENGTH)

    for (let i = 0; i < length; i++) {
      key += MASK[Math.round(Math.random() * (MASK.length - 1))]
    }
    this.router.navigate(['/' + key])
  }
}
