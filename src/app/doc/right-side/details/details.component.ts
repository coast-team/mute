import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations'
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'

import { Doc } from '../../../core/Doc'
import { RichCollaborator } from '../../../doc/rich-collaborators'

@Component({
  selector: 'mute-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('peerArriving', [
      state('active', style({transform: 'translateX(0)'})),
      state('void', style({transform: 'translateX(300px)'})),
      transition(':enter', animate('200ms ease-in')),
      transition(':leave', animate('200ms ease-out'))
    ])
  ]
})
export class DetailsComponent implements OnInit, OnDestroy {

  @Input() collaborators: Observable<RichCollaborator[]>
  @Input() doc: Doc

  private subs: Subscription

  public collabs: RichCollaborator[]

  constructor (
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit () {
    this.subs = this.collaborators.subscribe((collabs: RichCollaborator[]) => {
      this.collabs = collabs
      this.changeDetectorRef.detectChanges()
    })
  }

  ngOnDestroy () {
    this.subs.unsubscribe()
  }

}
