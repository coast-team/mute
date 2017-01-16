import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'

import { CollaboratorsService } from './collaborators.service'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
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
