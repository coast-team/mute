import { Injectable } from '@angular/core';

import { NetworkService } from '../network/network.service'

@Injectable()
export class ProfileService {

  private storagePrefix = 'mute'
  private pseudonymDefault = 'Anonymous'

  constructor(private network:NetworkService) {
    this.network.onJoin.subscribe(() => {
      console.log('Join event')
      this.network.emitPeerPseudo(this.pseudonym)
    })

    this.network.peerJoin.subscribe(id => {
      console.log('Join event')
      this.network.emitPeerPseudo(this.pseudonym, id)
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
    this.network.emitPeerPseudo(this.pseudonym)
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
