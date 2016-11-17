import { Injectable } from '@angular/core'

import { NetworkService } from '../network/network.service'

@Injectable()
export class ProfileService {

  private network: NetworkService

  private storagePrefix = 'mute'
  private pseudonymDefault = 'Anonymous'

  constructor(network: NetworkService) {
    this.network = network

    this.network.onPeerJoin.subscribe((id) => {
      this.network.sendPeerPseudo(this.pseudonym, id)
    })
  }

  get pseudonym () {
    let pseudonym = this.getItem('pseudonym')
    if (pseudonym === null) {
      return this.pseudonymDefault
    }
    return pseudonym
  }

  set pseudonym (value) {
    if (value !== '') {
      this.setItem('pseudonym', value)
    } else {
      this.removeItem('pseudonym')
    }
    this.network.sendPeerPseudo(this.pseudonym)
  }

  private setItem (key, value) {
    localStorage.setItem(this.storagePrefix + key, value)
  }

  private getItem (key) {
    return localStorage.getItem(this.storagePrefix + key)
  }

  private removeItem (key) {
    localStorage.removeItem(this.storagePrefix + key)
  }

}
