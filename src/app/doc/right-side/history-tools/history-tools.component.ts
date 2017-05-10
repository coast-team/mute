import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Doc } from '../../../core/Doc'

@Component({
  selector: 'mute-history-tools',
  templateUrl: './history-tools.component.html',
  styleUrls: ['./history-tools.component.css']
})
export class HistoryToolsComponent implements OnInit {

  private docId

  constructor (private route: ActivatedRoute, private router: Router) { }


  ngOnInit () {
    this.route.data
      .subscribe(({doc}: {doc: Doc}) => {this.docId = doc.id})
  }

  showHistory () {
    this.router.navigate(['/doc/history/' + this.docId])
  }

}
