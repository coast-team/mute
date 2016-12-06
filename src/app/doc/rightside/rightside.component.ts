import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'

import { NetworkService } from '../../core/network/network.service'
import { DocService } from '../doc.service'

@Component({
  selector: 'mute-rightside',
  templateUrl: './rightside.component.html',
  styleUrls: ['./rightside.component.scss']
})
export class RightsideComponent implements OnInit {

  private changeDetectorRef: ChangeDetectorRef
  private networkService: NetworkService
  private docService: DocService
  private doorOpened: boolean = false
  private title: string = ''

  @ViewChild('sidenavElm') sidenavElm
  menuIcon: string

  constructor (networkService: NetworkService, docService: DocService, changeDetectorRef: ChangeDetectorRef) {
    this.changeDetectorRef = changeDetectorRef
    this.networkService = networkService
    this.docService = docService

  }

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
