import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'

import { NetworkService } from '../../doc/network'
import { ProfileService } from '../../core/profile/profile.service'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss']
})
export class RightSideComponent implements OnDestroy, OnInit {

  private onDoorSubscription: Subscription

  constructor (
    private networkService: NetworkService,
    private changeDetectorRef: ChangeDetectorRef,
    public profile: ProfileService
  ) {}

  ngOnInit () {
    this.onDoorSubscription = this.networkService.onDoor.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })
  }

  ngOnDestroy () {
    this.onDoorSubscription.unsubscribe()
  }

  toggleDoor () {
    // this.networkService.openDoor(!this.doorOpened)
  }

  updatePseudo (pseudo: string) {
    this.profile.pseudonym = pseudo
  }
}
