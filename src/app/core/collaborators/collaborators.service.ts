import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { BehaviorSubject, ReplaySubject } from 'rxjs/Rx'

import * as randomMC from 'random-material-color'

import { NetworkService } from '../network/network.service'

@Injectable()
export class CollaboratorsService {

  /*
  * TODO: consider to provide collaborators map as Obsorvable in order
  * to be used with async-pipe.
  * See https://angular.io/docs/ts/latest/guide/pipes.html#!#async-pipe
  */

  private network: NetworkService
  private collaborators: Map<number, Collaborator>

  private joinSubject: ReplaySubject<{id: number, pseudo: string, color: string}>
  private leaveSubject: ReplaySubject<number>
  private pseudoSubject: BehaviorSubject<{id: number, pseudo: string}>

  constructor(network: NetworkService) {
    this.network = network
    this.collaborators = new Map<number, Collaborator>()
    this.joinSubject = new ReplaySubject<{id: number, pseudo: string, color: string}>()
    this.leaveSubject = new ReplaySubject<number>()
    this.pseudoSubject = new BehaviorSubject<{id: number, pseudo: string}>({id: -1, pseudo: null})

    this.network.onPeerJoin.subscribe((id) => {
      let collab = new Collaborator(randomMC.getColor({ shades: ['200', '300']}))
      this.collaborators.set(id, collab)
    })

    this.network.onPeerLeave.subscribe((id) => {
      this.collaborators.delete(id)
    })

    this.network.onPeerPseudo.subscribe(({id, pseudo}: {id: number, pseudo: string}) => {
      let collab = this.collaborators.get(id)
      if (collab !== undefined) {
        if (collab.pseudo === null) {
          this.joinSubject.next({id, pseudo, color: collab.color})
        } else {
          this.pseudoSubject.next({id, pseudo})
        }
        collab.pseudo = pseudo
      }
    })
  }

  get onJoin (): Observable<{id: number, pseudo: string, color: string}> {
    return this.joinSubject.asObservable()
  }

  get onLeave () {
    return this.leaveSubject.asObservable()
  }

  get onPseudoChange (): Observable<{id: number, pseudo: string}> {
    return this.pseudoSubject.asObservable()
  }

}

class Collaborator {
  public pseudo: string
  public color: string

  constructor (color: string) {
    this.pseudo = null
    this.color = color
  }
}
