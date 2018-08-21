import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Input()
  title: string
  @Output()
  menu: EventEmitter<void>

  constructor() {
    this.menu = new EventEmitter()
  }
}
