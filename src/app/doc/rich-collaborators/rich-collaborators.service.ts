import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core'
import { merge, Observable, Subject, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { ICollaborator } from '@coast-team/mute-core'

import { EProperties } from '@app/core/settings/EProperties.enum'
import { Profile, SettingsService } from '@app/core/settings'

import { Colors } from './Colors'
import { RichCollaborator } from './RichCollaborator'
import { NetworkServiceAbstracted } from '@app/doc/network/network.service.abstracted'

@Injectable()
export class RichCollaboratorsService implements OnDestroy {
  public collaborators: RichCollaborator[]
  private joinSubject: Subject<RichCollaborator>
  private leaveSubject: Subject<number>
  private updateSubject: Subject<RichCollaborator>
  private me: Promise<void>
  private colors: Colors
  private subs: Subscription[]
  private network: NetworkServiceAbstracted

  constructor(cd: ChangeDetectorRef, settings: SettingsService) {
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.updateSubject = new Subject()
    this.colors = new Colors()
    this.subs = []

    let me = this.createMe(settings.profile)
    this.collaborators = [me]
    this.me = Promise.resolve()
    this.subs.push(
      settings.onChange
        .pipe(filter((props) => props.includes(EProperties.profile) || props.includes(EProperties.profileDisplayName)))
        .subscribe((props) => {
          const index = this.collaborators.indexOf(me)
          if (props.includes(EProperties.profile)) {
            me = this.createMe(settings.profile)
          } else {
            me.displayName = settings.profile.displayName
          }
          this.collaborators[index] = me
          this.updateSubject.next(me)
        })
    )
    this.subs[this.subs.length] = this.onChanges.subscribe(() => cd.detectChanges())
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

  get onChanges(): Observable<void> {
    return merge(this.updateSubject, this.joinSubject, this.leaveSubject, this.me).pipe(map(() => undefined))
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  setNetwork(network: NetworkServiceAbstracted) {
    this.network = network
  }

  addCollaboratorToIdMap(muteCoreId: number) {
    this.network.idMap.addIds(NetworkServiceAbstracted.tempNetworkId, muteCoreId)
  }

  removeCollaboratorFromIdMap(muteCoreId: number) {
    this.network.idMap.removeIds(muteCoreId)
  }

  subscribeToUpdateSource(source: Observable<ICollaborator>) {
    this.subs.push(
      source.subscribe((collab: ICollaborator) => {
        for (const c of this.collaborators) {
          if (this.network.idMap.networkIdToMuteCoreIdMap.has(c.networkId)) {
            c.update(collab)
            this.updateSubject.next(c)
            break
          }
        }
      })
    )
  }

  subscribeToJoinSource(source: Observable<ICollaborator>) {
    this.subs.push(
      source.subscribe((collab) => {
        this.addCollaboratorToIdMap(collab.muteCoreId)
        const collabNetworkId = this.network.idMap.getNetworkId(collab.muteCoreId)
        const rc = new RichCollaborator(collabNetworkId, collab, this.colors.pick())
        this.network.addCollaboratorToGroup(rc)
        this.collaborators[this.collaborators.length] = rc
        this.joinSubject.next(rc)
      })
    )
  }

  subscribeToLeaveSource(source: Observable<ICollaborator>) {
    this.subs.push(
      source.subscribe((collaborator: ICollaborator) => {
        const collaboratorNetworkId = this.network.idMap.getNetworkId(collaborator.muteCoreId)
        this.removeCollaboratorFromIdMap(collaborator.muteCoreId)
        const indexGroupOfCollaborators = this.network.groupOfCollaborators.findIndex((c) => c.networkId === collaboratorNetworkId)
        this.network.removeCollaboratorFromGroup(indexGroupOfCollaborators)
        const index = this.collaborators.findIndex((c) => c.networkId === collaboratorNetworkId)
        this.colors.dismiss(this.collaborators[index].color)
        this.collaborators.splice(index, 1)
        this.leaveSubject.next(collaboratorNetworkId)
      })
    )
  }

  private createMe(profile: Profile): RichCollaborator {
    return new RichCollaborator(
      0,
      {
        login: profile.login,
        displayName: profile.displayName,
        deviceID: profile.deviceID,
        email: profile.email,
        avatar: profile.avatar,
      },
      this.colors.pick()
    )
  }
}
