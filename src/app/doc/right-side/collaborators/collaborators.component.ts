import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/core'
import { Subscription } from 'rxjs'

import { CollaboratorsService } from './collaborators.service'

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
export class CollaboratorsComponent implements OnDestroy, OnInit {

  private onJoinSubscription: Subscription
  private onLeaveSubscription: Subscription
  private onPseudoSubscription: Subscription

  constructor (
    private collabService: CollaboratorsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit () {
    this.onJoinSubscription = this.collabService.onJoin.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })

    this.onLeaveSubscription = this.collabService.onLeave.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })

    this.onPseudoSubscription = this.collabService.onPseudo.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })
  }

  ngOnDestroy () {
    this.onJoinSubscription.unsubscribe()
    this.onLeaveSubscription.unsubscribe()
    this.onPseudoSubscription.unsubscribe()
  }
}
