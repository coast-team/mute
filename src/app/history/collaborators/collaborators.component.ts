import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import { Author } from '@app/core/Author'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss'],
})
export class CollaboratorsComponent implements OnInit {
  @Input()
  docAuthors: Author[]
  @Output()
  collaboratorChanged = new EventEmitter<boolean>()

  constructor() {}

  ngOnInit() {}

  onChange(value: any) {
    this.collaboratorChanged.emit(value.checked)
  }
}
