import { Component, OnInit, ViewChild } from '@angular/core'

@Component({
  selector: 'mute-rightside',
  templateUrl: './rightside.component.html',
  styleUrls: ['./rightside.component.scss']
})
export class RightsideComponent implements OnInit {
  @ViewChild('sidenavElm') sidenavElm
  menuIcon: string

  constructor() { }

  ngOnInit() {
    this.sidenavElm.open()
  }

  toggleSidenav () {
    this.sidenavElm.toggle()
      .then(() => {
        this.menuIcon = this.sidenavElm.opened ? 'arrow_forward' : 'arrow_back'
      })
  }

}
