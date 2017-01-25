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

  @ViewChild('leftSidenavElm') leftSidenavElm
  @ViewChild('rightSidenavElm') rightSidenavElm
  private inited: boolean = false
  public leftVisible = true
  public rightVisible = true

  constructor (
    private route: ActivatedRoute,
    private network: NetworkService,
    public ui: UiService
  ) {}

  ngOnInit () {
    this.leftSidenavElm.onClose.subscribe(() => {
      this.ui.navOpened = false
      this.leftVisible = true
    })
    this.leftSidenavElm.onOpenStart.subscribe(() => {
      this.leftVisible = false
    })
    this.ui.onNavToggle.subscribe((open: boolean) => {
      this.leftSidenavElm.opened = open
    })
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
    this.rightSidenavElm.onOpenStart.subscribe(() => {
      this.rightVisible = false
    })
    this.rightSidenavElm.onClose.subscribe(() => {
      this.rightVisible = true
    })
    this.ui.onDocNavToggle.subscribe((open: boolean) => {
      this.rightSidenavElm.opened = open
    })
    if (this.ui.navOpened) {
      this.ui.closeNav()
      this.leftVisible = true
    }
    this.ui.openDocNav()
  }

  ngOnDestroy () {
    this.network.cleanWebChannel()
  }

}
