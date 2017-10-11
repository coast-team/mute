import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations'
import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core'
import { Observable } from 'rxjs/Rx'

import { Doc } from '../../../core/Doc'
import { RichCollaborator } from '../../../doc/rich-collaborators'

@Component({
  selector: 'mute-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('peerArriving', [
      state('active', style({transform: 'translateX(0)'})),
      state('void', style({transform: 'translateX(300px)'})),
      transition(':enter', animate('200ms ease-in')),
      transition(':leave', animate('200ms ease-out'))
    ])
  ]
})
export class DetailsComponent {

  @Input() collaborators: Observable<RichCollaborator[]>
  @Input() doc: Doc

  constructor () { }

}
