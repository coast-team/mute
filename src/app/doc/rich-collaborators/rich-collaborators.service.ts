import { ChangeDetectorRef, Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { Collaborator } from 'mute-core'
import { ProfileService } from '../../core/profile/profile.service'
import { COLORS } from './colors'
import { RichCollaborator } from './RichCollaborator'

@Injectable()
export class RichCollaboratorsService {

  private joinSubject: Subject<RichCollaborator>
  private leaveSubject: Subject<number>
  private changeSubject: Subject<{collab: RichCollaborator, prop: string}>
  private collaboratorsSubject: BehaviorSubject<RichCollaborator[]>

  private availableColors: string[]

  public collaborators: RichCollaborator[]

  constructor (
    private changeDetector: ChangeDetectorRef,
    public profile: ProfileService
  ) {
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.changeSubject = new Subject()
    this.collaboratorsSubject = new BehaviorSubject([])

    this.availableColors = COLORS.slice()
    const me = new RichCollaborator(-1, profile.pseudonym, this.pickColor())
    this.collaborators = [me]
    profile.onPseudonym.subscribe(
      (pseudo) => {
        me.pseudo = pseudo
        this.changeSubject.next({collab: me, prop: 'pseudo'})
        this.collaboratorsSubject.next(this.collaborators)
      }
    )
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
      const rc = this.findRichCollaborator(collab.id)

      // In some cases, it is possible to receive a message from a peer
      // before the corresponding peerJoin event is triggered.
      // In that case, add the new peer instead of trying to perform an update.
      if (rc instanceof RichCollaborator) {
        rc.pseudo = collab.pseudo
        this.changeSubject.next({collab: rc, prop: 'pseudo'})
        this.collaboratorsSubject.next(this.collaborators)
        this.changeDetector.detectChanges()
      } else {
        this.handleNewCollaborator(collab)
      }
    })
  }

  set joinSource (source: Observable<Collaborator>) {
    source.subscribe((collab: Collaborator) => {
      const rc = this.findRichCollaborator(collab.id)

      // Prevent from overriding the pseudo of the collaborator with
      // the default one if we already received a message from this peer.
      if (rc === undefined) {
        this.handleNewCollaborator(collab)
      }
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

  findRichCollaborator (id: number): RichCollaborator | undefined {
    return this.collaborators
      .find((rc: RichCollaborator): boolean => rc.id === id)
  }

  handleNewCollaborator (collab: Collaborator): void {
    const color = this.pickColor()
    const newRCollab = new RichCollaborator(collab.id, collab.pseudo, color)
    this.collaborators.push(newRCollab)
    this.joinSubject.next(newRCollab)
    this.collaboratorsSubject.next(this.collaborators)
    this.changeDetector.detectChanges()
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
