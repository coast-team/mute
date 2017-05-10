import { Component, OnInit } from '@angular/core'
import { DocHistoryService, Delete, Insert } from '../doc-history.service'
import { ActivatedRoute } from '@angular/router'
import { Doc } from '../../../core/Doc'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  docAuthors
  doc

  constructor (private docHistoryService: DocHistoryService, private route: ActivatedRoute) { }

  ngOnInit () {
    this.route.data.subscribe((data: {doc: Doc}) => {
      this.doc = data
    })

    this.docAuthors = this.docHistoryService.getAuthors(this.doc)
  }

}
