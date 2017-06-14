import { Injectable, ChangeDetectorRef } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { Collaborator } from 'mute-core'
import { RichCollaborator } from './RichCollaborator'
import { COLORS } from './colors'


@Injectable()
export class RichCollaboratorsService {

  private joinSubject: Subject<RichCollaborator>
  private leaveSubject: Subject<number>
  private changeSubject: Subject<{collab: RichCollaborator, prop: string}>
  private collaboratorsSubject: Subject<RichCollaborator[]>

  private availableColors: string[]

  public collaborators: RichCollaborator[]

  constructor (
    private changeDetector: ChangeDetectorRef
  ) {
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.changeSubject = new Subject()
    this.collaboratorsSubject = new Subject()

    this.availableColors = COLORS.slice()
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

  get onCollaborators (): Observable<RichCollaborator[]> {
    return this.collaboratorsSubject.asObservable()
  }

  set pseudoChangeSource (source: Observable<Collaborator>) {
    source.subscribe((collab: Collaborator) => {
      for (const rc of this.collaborators) {
        if (rc.id === collab.id) {
          rc.pseudo = collab.pseudo
          this.changeSubject.next({collab: rc, prop: 'pseudo'})
          this.collaboratorsSubject.next(this.collaborators)
          this.changeDetector.detectChanges()
          break
        }
      }
    })
  }

  set joinSource (source: Observable<Collaborator>) {
    source.subscribe((collab: Collaborator) => {
      const color = this.pickColor()
      const newRCollab = new RichCollaborator(collab.id, collab.pseudo, color)
      this.collaborators[this.collaborators.length] = newRCollab
      this.joinSubject.next(newRCollab)
      this.collaboratorsSubject.next(this.collaborators)
      this.changeDetector.detectChanges()
    })
  }

  set leaveSource (source: Observable<number>) {
    source.subscribe((id: number) => {
      for (let i = 0; i < this.collaborators.length; i++) {
        if (this.collaborators[i].id === id) {
          this.recycleColor(this.collaborators[i].color)
          this.collaborators.splice(i, 1)
          this.leaveSubject.next(id)
          this.collaboratorsSubject.next(this.collaborators)
          this.changeDetector.detectChanges()
          break
        }
      }
    })
  }

  pickColor (): string {
    if (this.availableColors.length !== 0) {
      const index = Math.floor(Math.random() * this.availableColors.length)
      for (let i = 0; i < this.availableColors.length; i++) {
        if (i === index) {
          const color = this.availableColors[index]
          this.availableColors.splice(i, 1)
          return color
        }
      }
    } else {
      return COLORS[Math.floor(Math.random() * COLORS.length)]
    }
  }

  recycleColor (color: string) {
    if (!this.availableColors.includes(color)) {
      this.availableColors.push(color)
    }
  }
}
