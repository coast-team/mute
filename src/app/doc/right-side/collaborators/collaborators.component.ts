import {
  animate,
  ChangeDetectorRef,
  Component,
  OnInit,
  state,
  style,
  transition,
  trigger
} from '@angular/core'
import { RichCollaborator, RichCollaboratorsService } from '../../../doc/rich-collaborators'

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
export class CollaboratorsComponent implements OnInit {

  private mapCollaborators: Map<number, RichCollaborator>

  constructor (
    private changeDetectorRef: ChangeDetectorRef,
    private collabService: RichCollaboratorsService
  ) {
    this.mapCollaborators = new Map()
  }

  ngOnInit (): void {
    this.collabService.onCollaboratorChangePseudo.subscribe((collaborator: RichCollaborator) => {
      this.mapCollaborators.set(collaborator.id, collaborator)
      this.changeDetectorRef.detectChanges()
    })

    this.collabService.onCollaboratorJoin.subscribe((collaborator: RichCollaborator) => {
      this.mapCollaborators.set(collaborator.id, collaborator)
      this.changeDetectorRef.detectChanges()
    })

    this.collabService.onCollaboratorLeave.subscribe((id: number) => {
      this.mapCollaborators.delete(id)
      this.changeDetectorRef.detectChanges()
    })
  }

  get collaborators (): RichCollaborator[] {
    const collaborators: RichCollaborator[] = []
    this.mapCollaborators.forEach((collaborator: RichCollaborator) => {
      collaborators.push(collaborator)
    })
    return collaborators
  }
}
