import { Component, OnInit, Input } from '@angular/core'
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
  doc

  constructor (private docHistoryService: DocHistoryService, private route: ActivatedRoute) { }

  ngOnInit () {

  }

}
