import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component } from '@angular/core'
import { UiService } from './core/ui/ui.service'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('update', [
      state('visible', style({ transform: 'translateX(0)' })),
      state('void', style({ transform: 'translateX(-500px)' })),
      transition(':enter', animate('400ms ease-out')),
      transition(':leave', animate('200ms ease-in')),
    ]),
  ],
})
export class AppComponent {
  public version: string
  public state: string

  constructor(ui: UiService) {
    ui.appUpdate.subscribe(({ version }) => {
      this.version = version
      this.state = 'visible'
    })
  }

  close() {
    this.state = 'void'
  }

  update() {
    document.location.reload()
  }
}
