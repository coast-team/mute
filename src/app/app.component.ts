import { Component, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { environment } from '../environments/environment'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public visible = environment.devLabel

  constructor (
    private router: Router
  ) { }
}
