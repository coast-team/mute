import { Component, OnInit, ViewChild } from '@angular/core'

@Component({
  selector: 'mute-rightside',
  templateUrl: './rightside.component.html',
  styleUrls: ['./rightside.component.scss']
})
export class RightsideComponent implements OnInit {
  @ViewChild('sidenav') sidenav

  constructor() { }

  ngOnInit() {
  }

  toggleSidenav () {
    this.sidenav.toggle()
  }

}
