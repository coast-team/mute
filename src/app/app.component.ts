import { Component, OnInit, ViewChild } from '@angular/core'

import { environment } from '../environments/environment'
import { UiService } from 'core/ui/ui.service'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('sidenavElm') sidenavElm
  public visible: boolean

  constructor (
    public ui: UiService
  ) {
    this.visible = environment.devLabel
  }

  ngOnInit () {
    this.sidenavElm.opened = true
    this.ui.onNavToggle.subscribe((open: boolean) => {
      this.sidenavElm.opened = open
    })
  }
}
