import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { Collaborator } from 'mute-core'
import { RichCollaborator } from './RichCollaborator'

import * as randomMC from 'random-material-color'


@Injectable()
export class RichCollaboratorsService {

  private collaboratorChangePseudoObservable: Observable<RichCollaborator>
  private collaboratorJoinObservable: Observable<RichCollaborator>
  private collaboratorLeaveObservable: Observable<number>

  private colors: Map<number, string>
  public collaborators: RichCollaborator[]

  constructor () {
    this.colors = new Map()
    this.collaborators = []
  }

  get onCollaboratorChangePseudo (): Observable<RichCollaborator> {
    return this.collaboratorChangePseudoObservable
  }

  get onCollaboratorJoin (): Observable<RichCollaborator> {
    return this.collaboratorJoinObservable
  }

  get onCollaboratorLeave (): Observable<number> {
    return this.collaboratorLeaveObservable
  }

  set collaboratorChangePseudoSource (source: Observable<Collaborator>) {
    this.collaboratorChangePseudoObservable = source.map((collaborator: Collaborator) => {
      const color: string = this.getColor(collaborator.id)
      return new RichCollaborator(collaborator.id, collaborator.pseudo, color)
    })
  }

  set collaboratorJoinSource (source: Observable<Collaborator>) {
    this.collaboratorJoinObservable = source.map((collaborator: Collaborator) => {
      const color: string = this.getColor(collaborator.id)
      return new RichCollaborator(collaborator.id, collaborator.pseudo, color)
    })
  }

  set collaboratorLeaveSource (source: Observable<number>) {
    this.collaboratorLeaveObservable = source.map((id: number) => {
      this.colors.delete(id)
      return id
    })
  }

  getColor (id: number): string {
    if (this.colors.has(id)) {
      return this.colors.get(id) as string
    } else {
      const color: string = randomMC.getColor({ shades: ['900', '800'] })
      this.colors.set(id, color)
      return color
    }
  }
}
