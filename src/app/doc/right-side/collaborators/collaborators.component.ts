import {
  Component,
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/core'

import { RichCollaboratorsService } from 'doc/rich-collaborators'

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
export class CollaboratorsComponent {

  constructor (
    private collabService: RichCollaboratorsService
  ) {}
}
