import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, Input } from '@angular/core'
import { ICollaborator } from 'mute-core'

import { Doc } from '../../../core/Doc'
import { RichCollaborator } from '../../rich-collaborators'

const defaultCollab = { avatar: '', displayName: '', login: '' }

@Component({
  selector: 'mute-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('joinLeave', [
      state('active', style({ transform: 'translateX(0)' })),
      state('void', style({ transform: 'translateX(300px)' })),
      transition(':enter', animate('200ms ease-in')),
      transition(':leave', animate('200ms ease-out')),
    ]),
    trigger('cardState', [
      state('visible', style({ opacity: '1' })),
      state('void', style({ opacity: '0' })),
      transition('void => visible', animate('150ms ease-in')),
      transition('visible => void', animate('150ms ease-out')),
    ]),
  ],
})
export class DetailsComponent {
  @Input() doc: Doc
  @Input() collaborators: RichCollaborator[]

  public card: { avatar: string; displayName: string; login: string }
  public cardState: string

  constructor(private cd: ChangeDetectorRef) {
    this.card = defaultCollab
  }

  showCard(collab: ICollaborator) {
    this.card = Object.assign({}, defaultCollab, collab)
    this.cardState = 'visible'
    this.cd.detectChanges()
  }

  hideCard() {
    this.cardState = 'void'
    this.cd.detectChanges()
  }
}
