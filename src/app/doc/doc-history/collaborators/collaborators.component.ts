import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { DocHistoryService, Delete, Insert } from '../doc-history.service'
import { ActivatedRoute } from '@angular/router'
import { Doc } from '../../../core/Doc'
import { Author } from '../../../core/Author'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  @Input() docAuthors: Author[]
  @Output() change = new EventEmitter<boolean>()

  constructor (private docHistoryService: DocHistoryService, private route: ActivatedRoute) { }

  ngOnInit () {
  }

  onChange (value: any) {
    this.change.emit(value.checked)
  }

}
