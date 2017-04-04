import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { Collaborator } from 'mute-core'
import { RichCollaborator } from './RichCollaborator'

import * as randomMC from 'random-material-color'


@Injectable()
export class RichCollaboratorsService {

  private joinSubject: Subject<RichCollaborator>
  private leaveSubject: Subject<number>
  private changeSubject: Subject<{collab: RichCollaborator, prop: string}>

  private colors: Map<number, string>

  public collaborators: RichCollaborator[]

  constructor () {
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.changeSubject = new Subject()

    this.colors = new Map()
    this.collaborators = []
  }

  get onChange (): Observable<{collab: RichCollaborator, prop: string}> {
    return this.changeSubject.asObservable()
  }

  get onJoin (): Observable<RichCollaborator> {
    return this.joinSubject.asObservable()
  }

  get onLeave (): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  set pseudoChangeSource (source: Observable<Collaborator>) {
    source.subscribe((collab: Collaborator) => {
      const color: string = this.getColor(collab.id)
      for (const rc of this.collaborators) {
        if (rc.id === collab.id) {
          rc.pseudo = collab.pseudo
          this.changeSubject.next({collab: rc, prop: 'pseudo'})
          break
        }
      }
    })
  }

  set joinSource (source: Observable<Collaborator>) {
    source.subscribe((collab: Collaborator) => {
      const color: string = this.getColor(collab.id)
      const newRCollab = new RichCollaborator(collab.id, collab.pseudo, color)
      this.collaborators[this.collaborators.length] = newRCollab
      this.joinSubject.next(newRCollab)
    })
  }

  set leaveSource (source: Observable<number>) {
    source.subscribe((id: number) => {
      this.colors.delete(id)
      for (let i = 0; i < this.collaborators.length; i++) {
        if (this.collaborators[i].id === id) {
          this.collaborators.splice(i, 1)
          this.leaveSubject.next(id)
          break
        }
      }
    },
    () => {},
    () => {
      this.colors.forEach((color: string, id: number) => {
        this.colors.delete(id)
        this.leaveSubject.next(id)
      })
    })
  }

  getColor (id: number): string {
    if (this.colors.has(id)) {
      return this.colors.get(id)
    } else {
      const color: string = randomMC.getColor({ shades: ['900', '800'] })
      this.colors.set(id, color)
      return color
    }
  }
}
