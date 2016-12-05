import { Component, OnInit, ViewChild } from '@angular/core'

import { NetworkService } from '../../core/network/network.service'

@Component({
  selector: 'mute-rightside',
  templateUrl: './rightside.component.html',
  styleUrls: ['./rightside.component.scss']
})
export class RightsideComponent implements OnInit {

  private networkService: NetworkService
  private doorOpened: boolean = false

  @ViewChild('sidenavElm') sidenavElm
  menuIcon: string

  constructor (networkService: NetworkService) {
    this.networkService = networkService

    networkService.onDoor.subscribe((opened) => {
      this.doorOpened = opened
      log.debug('Door status changed to : ' + opened)
    })
  }

  ngOnInit () {
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

}
