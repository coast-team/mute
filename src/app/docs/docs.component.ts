import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { BotStorageService } from '../core/bot-storage/bot-storage.service'

@Component({
  selector: 'mute-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit {

  private router: Router
  private botStorageService: BotStorageService
  private currentBot: {url: string, key: string} = {url: null, key: null}
  private docs: Array<Object> = []
  private hasDocuments: boolean

  constructor (router: Router, botStorageService: BotStorageService) {
    this.router = router
    this.botStorageService = botStorageService
  }

  ngOnInit () {
    this.botStorageService.reachable()
      .then(() => {
        this.hasDocuments = true
        this.botStorageService.getDocuments()
          .then((docs: any) => {
            this.docs = docs
          })
      })
      .catch(() => {
        this.hasDocuments = false
      })
  }

  openDoc (key: string) {
    this.currentBot.url = this.botStorageService.getURL()
    this.currentBot.key = key
    this.router.navigate(['/' + key])
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
