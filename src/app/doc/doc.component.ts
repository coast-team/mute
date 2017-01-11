import { Component, Injectable, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'

import { DocService } from './doc.service'
import { NetworkService } from 'doc/network'
import { UiService } from 'core/ui/ui.service'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [ ]
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {

  private inited: boolean = false

  constructor (
    private route: ActivatedRoute,
    private network: NetworkService,
    private doc: DocService,
    private ui: UiService
  ) {}

  ngOnInit () {
    this.route.params.subscribe((params: Params) => {
      const key = params['key'] // (+) converts string 'id' to a number
      if (this.inited) {
        // Need to clean the services before
        this.network.cleanWebChannel()
      }
      this.network.initWebChannel()
      this.network.join(key)
      this.inited = true
    })
  }

  ngOnDestroy () {
    this.network.cleanWebChannel()
  }

  openNav () {
    this.ui.openNav()
  }

}
