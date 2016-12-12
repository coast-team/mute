import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { BehaviorSubject, ReplaySubject } from 'rxjs/Rx'

import * as randomMC from 'random-material-color'

import { NetworkService, NetworkMessage } from 'core/network'
import { Collaborator } from 'core/collaborators/Collaborator'
const pb = require('./message_pb.js')

@Injectable()
export class CollaboratorsService {

  /*
  * TODO: consider to provide collaborators map as Observable in order
  * to be used with async-pipe.
  * See https://angular.io/docs/ts/latest/guide/pipes.html#!#async-pipe
  */

  private joinSubject: ReplaySubject<Collaborator>
  private leaveSubject: ReplaySubject<Collaborator>
  private updateSubject: BehaviorSubject<Collaborator>

  public collaborators: Set<Collaborator>

  constructor(
    private network: NetworkService
  ) {
    this.collaborators = new Set<Collaborator>()
    this.joinSubject = new ReplaySubject<Collaborator>()
    this.leaveSubject = new ReplaySubject<Collaborator>()
    this.updateSubject = new BehaviorSubject<Collaborator>(null)

    this.network.onLeave.subscribe(() => {
      this.collaborators = new Set<Collaborator>()
    })

    this.network.onPeerJoin.subscribe((id) => {
      const collab = new Collaborator(id, randomMC.getColor({ shades: ['200', '300']}))
      this.collaborators.add(collab)
      this.joinSubject.next(collab)
    })

    this.network.onPeerLeave.subscribe((id) => {
      const collab = this.getCollaborator(id)
      if (this.collaborators.delete(collab)) {
        this.leaveSubject.next(collab)
      }
    })

    this.network.onMessage.subscribe((msg: NetworkMessage) => {
      log.debug('SERVICE: ' + msg.service)
      if (msg.service === this.constructor.name) {
        const collab = this.getCollaborator(msg.id)
        if (collab !== null) {
          const oldPseudo = collab.pseudo
          collab.pseudo = new pb.Collaborator.deserializeBinary(msg.content).getPseudo()
          if (oldPseudo === null) {
            this.joinSubject.next(collab)
          } else {
            this.updateSubject.next(collab)
          }
        }
      }
    })
  }

  get onJoin (): Observable<Collaborator> {
    return this.joinSubject.asObservable()
  }

  get onLeave (): Observable<Collaborator> {
    return this.leaveSubject.asObservable()
  }

  get onUpdate (): Observable<Collaborator> {
    return this.updateSubject.asObservable()
  }

  update (pseudo: string, id?: number) {
    let collabMsg = new pb.Collaborator()
    collabMsg.setPseudo(pseudo)
    this.network.newSend(this.constructor.name, collabMsg.serializeBinary(), id)
  }

  getCollaborator (id: number): Collaborator | null {
    let collab: Collaborator = null
    this.collaborators.forEach((value) => {
      if (value.id === id) {
        collab = value
      }
    })
    return collab
  }

}
