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

  docAuthors: any[] = []
  doc

  constructor (private docHistoryService: DocHistoryService, private route: ActivatedRoute) { }

  ngOnInit () {
    this.route.data.subscribe((data: {doc: Doc}) => {
      this.docHistoryService.getOperations(data.doc)
        .then((ops: (Delete | Insert)[]) => {
          for (let o of ops) {
            let author = {
              authorId: o.authorId,
              authorName: o.authorName,
              authorColor: 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
            }

            if (this.docAuthors.filter((e) => {
              return e.authorId === author.authorId
            }).length === 0) {
              this.docAuthors.push(author)
            }
          }
        })
    })
  }

}
