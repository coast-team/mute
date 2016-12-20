import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'

import { NetworkService } from 'doc/network'
import { DocService } from 'doc/doc.service'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss']
})
export class RightSideComponent implements OnInit {

  private doorOpened: boolean = false
  private title: string = ''

  @ViewChild('sidenavElm') sidenavElm
  menuIcon: string

  constructor (
    private networkService: NetworkService,
    private docService: DocService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit () {
      this.networkService.onDoor.subscribe((opened) => {
        this.doorOpened = opened
        this.changeDetectorRef.detectChanges()
      })

      this.networkService.onDocTitle.subscribe((title: string) => {
        this.title = title
        this.changeDetectorRef.detectChanges()
      })
    this.sidenavElm.open()
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
