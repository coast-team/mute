import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'

import { NetworkService } from 'doc/network'
import { UiService } from 'core/ui/ui.service'
import { ProfileService } from 'core/profile/profile.service'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss']
})
export class RightSideComponent implements OnDestroy, OnInit {

  private onDoorSubscription: Subscription
  private onDocTitleSubscription: Subscription

  public doorOpened: boolean = false
  public title: string = ''

  @ViewChild('sidenavElm') sidenavElm
  menuIcon: string

  constructor (
    private networkService: NetworkService,
    private changeDetectorRef: ChangeDetectorRef,
    public ui: UiService,
    public profile: ProfileService
  ) {}

  ngOnInit () {
    this.onDoorSubscription = this.networkService.onDoor.subscribe((opened) => {
      this.doorOpened = opened
      this.changeDetectorRef.detectChanges()
    })

    this.onDocTitleSubscription = this.networkService.onDocTitle.subscribe((title: string) => {
      this.title = title
      this.changeDetectorRef.detectChanges()
    })
    // this.sidenavElm.open()
  }

  ngOnDestroy () {
    this.onDoorSubscription.unsubscribe()
    this.onDocTitleSubscription.unsubscribe()
  }

  toggleDoor () {
    this.networkService.openDoor(!this.doorOpened)
  }

}
