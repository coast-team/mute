import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Author } from '../../core/Author'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss'],
})
export class CollaboratorsComponent implements OnInit {
  @Input()
  docAuthors: Author[]
  @Output()
  change = new EventEmitter<boolean>()

  constructor() {}

  ngOnInit() {}

  onChange(value: any) {
    this.change.emit(value.checked)
  }
}
