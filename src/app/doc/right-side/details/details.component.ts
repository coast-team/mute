import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, Input } from '@angular/core'

import { ICollaborator } from 'mute-core'
import { Doc } from '../../../core/Doc'
import { RichCollaborator } from '../../../doc/rich-collaborators'

@Component({
  selector: 'mute-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('peerArriving', [
      state('active', style({ transform: 'translateX(0)' })),
      state('void', style({ transform: 'translateX(300px)' })),
      transition(':enter', animate('200ms ease-in')),
      transition(':leave', animate('200ms ease-out')),
    ]),
    trigger('cardState', [
      state('visible', style({ opacity: '1' })),
      state('void', style({ opacity: '0', display: 'none' })),
      transition('void => visible', animate('150ms ease-in')),
      transition('visible => void', animate('150ms ease-out')),
    ]),
  ],
})
export class DetailsComponent {
  @Input() collaborators: RichCollaborator[]
  @Input() doc: Doc

  constructor(private cd: ChangeDetectorRef) {}

  showCard(collab: ICollaborator) {
    ;(collab as any).cardState = 'visible'
    this.cd.detectChanges()
  }

  hideCard(collab: ICollaborator) {
    ;(collab as any).cardState = 'void'
    this.cd.detectChanges()
  }
}
