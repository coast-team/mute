import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'

import { DocService } from './doc.service'
import { NetworkService } from '../core/network/network.service'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  providers: [DocService],
  styleUrls: ['./doc.component.css']
})
export class DocComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private network: NetworkService
  ) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let key = params['key']; // (+) converts string 'id' to a number
      console.log('Key is: ' + key)
      this.network.join(key)
    })
  }

}
