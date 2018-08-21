import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core'

import { Folder } from '../../core/Folder'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnChanges {
  @Input()
  folder: Folder
  @Output()
  menu: EventEmitter<void>

  public header: string

  constructor() {
    this.menu = new EventEmitter()
  }

  ngOnChanges() {
    this.header = this.folder.title
    if (this.folder.isRemote) {
      this.header += `: ${this.folder.id}`
    }
  }
}
