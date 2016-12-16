import { Component } from '@angular/core'

import { environment } from '../environments/environment'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public visible: boolean

  constructor () {
    this.visible = environment.devLabel
  }
}
