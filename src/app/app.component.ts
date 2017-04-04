import { Component, ChangeDetectionStrategy } from '@angular/core'

import { environment } from '../environments/environment'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public visible: boolean

  constructor (
  ) {
    this.visible = environment.devLabel
  }

  isVisible () {
    log.debug('Dev-Label: Detect change run...')
    return this.visible
  }
}
