import { Component, Injectable, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'

import { DocService } from './doc.service'
import { NetworkService } from 'doc/network'
import { UiService } from 'core/ui/ui.service'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.css'],
  providers: [ ]
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {

  constructor (
    private route: ActivatedRoute,
    private network: NetworkService,
    private doc: DocService,
    private ui: UiService
  ) {}

  ngOnInit () {
    this.route.params.forEach((params: Params) => {
      let key = params['key'] // (+) converts string 'id' to a number
      this.network.join(key)
    })
  }

  ngOnDestroy () {
    this.doc.clean()
  }

  openNav () {
    this.ui.openNav()
  }

}
