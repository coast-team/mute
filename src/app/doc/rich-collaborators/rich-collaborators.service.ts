import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { Collaborator } from 'mute-core'
import { RichCollaborator } from './RichCollaborator'

import * as randomMC from 'random-material-color'


@Injectable()
export class RichCollaboratorsService {

  private collaboratorChangePseudoSubject: Subject<RichCollaborator>
  private collaboratorJoinSubject: Subject<RichCollaborator>
  private collaboratorLeaveSubject: Subject<number>

  private colors: Map<number, string>
  public collaborators: RichCollaborator[]

  constructor () {
    this.collaboratorChangePseudoSubject = new Subject()
    this.collaboratorJoinSubject = new Subject()
    this.collaboratorLeaveSubject = new Subject()

    this.colors = new Map()
    this.collaborators = []
  }

  get onCollaboratorChangePseudo (): Observable<RichCollaborator> {
    return this.collaboratorChangePseudoSubject.asObservable()
  }

  get onCollaboratorJoin (): Observable<RichCollaborator> {
    return this.collaboratorJoinSubject.asObservable()
  }

  get onCollaboratorLeave (): Observable<number> {
    return this.collaboratorLeaveSubject.asObservable()
  }

  set collaboratorChangePseudoSource (source: Observable<Collaborator>) {
    source.subscribe((collaborator: Collaborator) => {
      const color: string = this.getColor(collaborator.id)
      this.collaboratorChangePseudoSubject.next(new RichCollaborator(collaborator.id, collaborator.pseudo, color))
    })
  }

  set collaboratorJoinSource (source: Observable<Collaborator>) {
    source.subscribe((collaborator: Collaborator) => {
      const color: string = this.getColor(collaborator.id)
      this.collaboratorJoinSubject.next(new RichCollaborator(collaborator.id, collaborator.pseudo, color))
    })
  }

  set collaboratorLeaveSource (source: Observable<number>) {
    source.subscribe((id: number) => {
      this.colors.delete(id)
      this.collaboratorLeaveSubject.next(id)
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
