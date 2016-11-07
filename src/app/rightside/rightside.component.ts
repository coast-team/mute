import { Component, OnInit, AfterContentInit, ViewChild } from '@angular/core'

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
  }

  ngAfterContentInit () {
    this.menuIcon = this.sidenavElm.opened ? 'arrow_forward' : 'arrow_back'
  }

  toggleSidenav () {
    this.sidenavElm.toggle()
      .then(() => {
        this.menuIcon = this.sidenavElm.opened ? 'arrow_forward' : 'arrow_back'
      })
  }

}
