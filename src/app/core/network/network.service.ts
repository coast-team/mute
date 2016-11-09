import { Injectable } from '@angular/core'
import  * as netflux  from 'netflux'
import { Observable } from 'rxjs'
import { BehaviorSubject, ReplaySubject, AsyncSubject } from "rxjs/Rx"


@Injectable()
export class NetworkService {

  private webChannel

  private _join: AsyncSubject<null>
  private _peerJoin: ReplaySubject<number>
  private _peerLeave: ReplaySubject<number>
  private _peerPseudo: BehaviorSubject<Object>
  private _peerCursor: BehaviorSubject<number>
  private _peerSelection: BehaviorSubject<number>

  constructor() {
    this._join = new AsyncSubject<null>()
    this._peerJoin = new ReplaySubject<number>()
    this._peerLeave = new ReplaySubject<number>()
    this._peerPseudo = new BehaviorSubject<string>('Anonimous')
  }

  get onJoin () {
    return this._join.asObservable()
  }

  get peerJoin () {
    return this._peerJoin.asObservable()
  }

  get peerLeave () {
    return this._peerLeave.asObservable()
  }

  get peerPseudo () {
    return this._peerPseudo.asObservable()
  }

  get peerCursor () {
    return this._peerCursor.asObservable()
  }

  get peerSelection() {
    return this._peerSelection.asObservable()
  }

  emitPeerPseudo(pseudo: string, id: number = -1) {
    if (id !== -1) {
      this.webChannel.sendTo(id, JSON.stringify({
        type: 1,
        pseudo
      }))
    } else {
      this.webChannel.send(JSON.stringify({
        type: 1,
        pseudo
      }))
    }
    this.webChannel.send(JSON.stringify({
      type: 1,
      pseudo
    }))
  }

  join (key) {
    this.webChannel = netflux.create()
    this.webChannel.onMessage = (id, message, isBroadcast) => {
      let obj = JSON.parse(message)
      if (obj.type === 1) {
        console.log('My pseudo ' + obj.pseudo)
        this._peerPseudo.next({ id, pseudo: obj.pseudo })
      }
      // let msg = Message.deserializeBinary(bytes)
      // switch (msg.getType())  {
      //   case Message.Type.PEER_PSEUDO:
      //     this._peerPseudo.next({id, pseudo: msg.getConent()})
      // }
    }
    this.webChannel.onPeerJoin = id => { this._peerJoin.next(id) }
    this.webChannel.onPeerLeave = id => { this._peerLeave.next(id) }
    return this.webChannel.open({key})
      .then(() => {
        console.log('Has OPENED')
      })
      .catch(() => {
        return this.webChannel.join(key)
          .then(() => {
            console.log('Has JOINED')
            this._join.next(null)
            this._join.complete()
          })
      })
  }

  send (message: string) {
    this.webChannel(message)
  }

}
