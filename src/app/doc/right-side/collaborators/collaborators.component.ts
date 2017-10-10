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
import { RichCollaborator } from '../../../doc/rich-collaborators'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('peerArriving', [
      state('active', style({transform: 'translateX(0)'})),
      state('void', style({transform: 'translateX(100%)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ])
  ]
})
export class CollaboratorsComponent {

  @Input() collaborators: Observable<RichCollaborator[]>

  constructor () {}
}
