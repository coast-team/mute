import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'

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

  @ViewChild('rightSidenavElm') rightSidenavElm
  private inited = false

  constructor (
    private route: ActivatedRoute,
    private network: NetworkService,
    public ui: UiService
  ) {}

  ngOnInit () {
    this.route.params.subscribe((params: Params) => {
      log.angular('DocComponent init')
      const key = params['key'] // (+) converts string 'id' to a number
      if (this.inited) {
        // Need to clean the services before
        this.network.cleanWebChannel()
      }
      this.network.initWebChannel()
      this.network.join(key)
      this.inited = true
    })
    this.ui.onDocNavToggle.subscribe((open: boolean) => {
      this.rightSidenavElm.opened = open
    })
    if (this.ui.navOpened) {
      this.ui.closeNav()
    }
    this.ui.openDocNav()
  }

  ngOnDestroy () {
    log.angular('DocComponent destroyed')
    this.network.cleanWebChannel()
  }

}
