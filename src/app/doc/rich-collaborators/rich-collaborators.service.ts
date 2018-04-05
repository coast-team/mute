import { Injectable } from '@angular/core'
import { ICollaborator } from 'mute-core'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject'

import { EProperties } from '../../core/settings/EProperties'
import { SettingsService } from '../../core/settings/settings.service'
import { NetworkService } from '../network'
import { COLORS } from './colors'
import { RichCollaborator } from './RichCollaborator'

@Injectable()
export class RichCollaboratorsService {
  private joinSubject: Subject<RichCollaborator>
  private leaveSubject: Subject<number>
  private updateSubject: Subject<RichCollaborator>

  private availableColors: string[]

  public collaborators: RichCollaborator[]

  constructor(settings: SettingsService, network: NetworkService) {
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.updateSubject = new Subject()

    this.availableColors = COLORS.slice()

    let me = new RichCollaborator(
      {
        id: -1,
        login: settings.profile.login,
        displayName: settings.profile.displayName,
        email: settings.profile.email,
        avatar: settings.profile.avatar,
      },
      this.pickColor()
    )
    this.collaborators = [me]
    settings.onChange
      .pipe(filter((props) => props.includes(EProperties.profile) || props.includes(EProperties.profileDisplayName)))
      .subscribe((props) => {
        const index = this.collaborators.indexOf(me)
        if (props.includes(EProperties.profile)) {
          me = new RichCollaborator(
            {
              id: -1,
              login: settings.profile.login,
              displayName: settings.profile.displayName,
              email: settings.profile.email,
              avatar: settings.profile.avatar,
            },
            this.pickColor()
          )
        } else {
          me.displayName = settings.profile.displayName
        }
        this.collaborators[index] = me
        this.updateSubject.next(me)
      })
  }

  get onUpdate(): Observable<RichCollaborator> {
    return this.updateSubject.asObservable()
  }

  get onJoin(): Observable<RichCollaborator> {
    return this.joinSubject.asObservable()
  }

  get onLeave(): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  set updateSource(source: Observable<ICollaborator>) {
    source.subscribe((collab: ICollaborator) => this.newOrUpdateCollab(collab))
  }

  set joinSource(source: Observable<number>) {
    source.subscribe((id: number) => this.newOrUpdateCollab({ id }))
  }

  set leaveSource(source: Observable<number>) {
    source.subscribe((id: number) => {
      this.collaborators = this.collaborators.filter((c) => c.id !== id)
      this.leaveSubject.next(id)
    })
  }

  private newOrUpdateCollab(collab: ICollaborator): void {
    let rc
    for (const c of this.collaborators) {
      if (collab.id === c.id) {
        c.update(collab)
        rc = c
        break
      }
    }

    this.collaborators = this.collaborators.slice(0)
    if (!rc) {
      rc = new RichCollaborator(collab, this.pickColor())
      this.collaborators.push(rc)
      this.joinSubject.next(rc)
    } else {
      this.updateSubject.next(rc)
    }
  }

  private pickColor(): string {
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
}
