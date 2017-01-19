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
  private inited: boolean = false
  public rightMenuBtnVisible = true

  constructor (
    private route: ActivatedRoute,
    private network: NetworkService,
    public ui: UiService
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
    this.rightSidenavElm.onOpenStart.subscribe(() => {
      this.rightMenuBtnVisible = false
    })
    this.rightSidenavElm.onClose.subscribe(() => {
      this.rightMenuBtnVisible = true
    })
    this.ui.onDocNavToggle.subscribe((open: boolean) => {
      this.rightSidenavElm.opened = open
    })
    this.ui.openDocNav()
  }

  ngOnDestroy () {
    this.network.cleanWebChannel()
  }

}
