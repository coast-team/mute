import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { BehaviorSubject, ReplaySubject } from 'rxjs/Rx'

import * as randomMC from 'random-material-color'

import { NetworkService, NetworkMessage } from 'core/network'
import { Collaborator } from 'core/collaborators'
const pb = require('./collaborator_pb.js')

@Injectable()
export class CollaboratorsService {

  private joinSubject: ReplaySubject<Collaborator>
  private leaveSubject: ReplaySubject<Collaborator>
  private pseudoSubject: BehaviorSubject<Collaborator>

  public collaborators: Set<Collaborator>

  constructor(
    private network: NetworkService
  ) {
    this.collaborators = new Set<Collaborator>()
    this.joinSubject = new ReplaySubject<Collaborator>()
    this.leaveSubject = new ReplaySubject<Collaborator>()
    this.pseudoSubject = new BehaviorSubject<Collaborator>(null)

    this.network.onLeave.subscribe(() => {
      this.collaborators = new Set<Collaborator>()
    })

    this.network.onPeerJoin.subscribe((id) => {
      const collab = new Collaborator(id, randomMC.getColor({ shades: ['900', '800']}))
      this.collaborators.add(collab)
      this.joinSubject.next(collab)
    })

    this.network.onPeerLeave.subscribe((id) => {
      const collab = this.getCollaboratorById(id)
      if (this.collaborators.delete(collab)) {
        this.leaveSubject.next(collab)
      }
    })

    this.network.onMessage.subscribe((msg: NetworkMessage) => {
      if (msg.service === this.constructor.name) {
        const pbCollaborator = new pb.Collaborator.deserializeBinary(msg.content)
        const collaborator = this.getCollaboratorById(msg.id)
        if (collaborator !== null) {
            const oldPseudo = collaborator.pseudo
            collaborator.pseudo = pbCollaborator.getPseudo()
            if (oldPseudo === null) {
              this.joinSubject.next(collaborator)
            } else {
              this.pseudoSubject.next(collaborator)
            }
        }
      }
    })
  }

  get onJoin (): Observable<Collaborator> { return this.joinSubject.asObservable() }

  get onLeave (): Observable<Collaborator> { return this.leaveSubject.asObservable() }

  get onPseudo (): Observable<Collaborator> { return this.pseudoSubject.asObservable() }

  updatePseudo (pseudo: string, id?: number) {
    let collabMsg = new pb.Collaborator()
    collabMsg.setPseudo(pseudo)
    this.network.newSend(this.constructor.name, collabMsg.serializeBinary(), id)
  }

  getCollaboratorById (id: number): Collaborator | null {
    let collab: Collaborator = null
    this.collaborators.forEach((value) => {
      if (value.id === id) {
        collab = value
      }
    })
    return collab
  }

}
