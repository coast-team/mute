import { Component, Injectable, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'

import { DocService } from './doc.service'
import { EditorService } from 'editor/editor.service'
import { NetworkService } from '../core/network/network.service'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  providers: [DocService, EditorService],
  styleUrls: ['./doc.component.css']
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {

  private docService: DocService
  private route: ActivatedRoute
  private network: NetworkService

  constructor(route: ActivatedRoute, network: NetworkService, docService: DocService) {
    this.route = route
    this.network = network
    this.docService = docService
  }

  ngOnInit () {
    this.route.params.forEach((params: Params) => {
      let key = params['key'] // (+) converts string 'id' to a number
      this.network.join(key)
    })
  }

  ngOnDestroy () {
    this.docService.clean()
  }

}
