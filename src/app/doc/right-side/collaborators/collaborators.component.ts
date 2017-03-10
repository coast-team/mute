import {
  animate,
  ChangeDetectorRef,
  Component,
  OnInit,
  state,
  style,
  transition,
  trigger,
  OnDestroy
} from '@angular/core'
import { RichCollaborator, RichCollaboratorsService } from '../../../doc/rich-collaborators'
import { Subscription } from 'rxjs/Rx'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss'],
  animations: [
    trigger('peerArriving', [
      state('active', style({transform: 'translateX(0)'})),
      state('void', style({transform: 'translateX(100%)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ])
  ]
})
export class CollaboratorsComponent implements OnInit, OnDestroy {

  private mapCollaborators: Map<number, RichCollaborator>
  private collabChangeSubs: Subscription
  private collabJoinSubs: Subscription
  private collabLeaveSubs: Subscription

  constructor (
    private changeDetectorRef: ChangeDetectorRef,
    private collabService: RichCollaboratorsService
  ) {
    this.mapCollaborators = new Map()
  }

  ngOnInit (): void {
    this.collabChangeSubs = this.collabService.onCollaboratorChangePseudo.subscribe((collaborator: RichCollaborator) => {
      this.mapCollaborators.set(collaborator.id, collaborator)
      this.changeDetectorRef.detectChanges()
    })

    this.collabJoinSubs = this.collabService.onCollaboratorJoin.subscribe((collaborator: RichCollaborator) => {
      this.mapCollaborators.set(collaborator.id, collaborator)
      this.changeDetectorRef.detectChanges()
    })

    this.collabLeaveSubs = this.collabService.onCollaboratorLeave.subscribe((id: number) => {
      this.mapCollaborators.delete(id)
      this.changeDetectorRef.detectChanges()
    })
  }

  ngOnDestroy () {
    this.collabChangeSubs.unsubscribe()
    this.collabJoinSubs.unsubscribe()
    this.collabLeaveSubs.unsubscribe()
  }

  get collaborators (): RichCollaborator[] {
    const collaborators: RichCollaborator[] = []
    this.mapCollaborators.forEach((collaborator: RichCollaborator) => {
      collaborators.push(collaborator)
    })
    return collaborators
  }
}
