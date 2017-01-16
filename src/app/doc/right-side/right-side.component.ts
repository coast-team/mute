import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'

import { NetworkService } from 'doc/network'
import { DocService } from 'doc/doc.service'

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
    private docService: DocService,
    private changeDetectorRef: ChangeDetectorRef
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
    this.sidenavElm.open()
  }

  ngOnDestroy () {
    this.onDoorSubscription.unsubscribe()
    this.onDocTitleSubscription.unsubscribe()
  }

  toggleSidenav () {
    this.sidenavElm.toggle()
      .then(() => {
        this.menuIcon = this.sidenavElm.opened ? 'arrow_forward' : 'arrow_back'
      })
  }

  toggleDoor () {
    this.networkService.openDoor(!this.doorOpened)
  }

  updateTitle (event) {
    this.docService.setTitle(event.target.value)
  }

}
