import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core'
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'
import { RichCollaborator } from '../../../doc/rich-collaborators'
import { Observable } from 'rxjs/Rx'

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
