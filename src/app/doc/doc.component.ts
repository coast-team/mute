import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'

import { ProfileService } from 'core/profile/profile.service'
import { EditorService } from 'doc/editor/editor.service'
import { NetworkService } from 'doc/network'
import { RichCollaboratorsService } from 'doc/rich-collaborators'
import { UiService } from 'core/ui/ui.service'

import { MuteCore } from 'mute-core'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [ RichCollaboratorsService ]
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {

  @ViewChild('rightSidenavElm') rightSidenavElm
  private inited = false

  private muteCore: MuteCore

  constructor (
    private richCollaboratorsService: RichCollaboratorsService,
    private profile: ProfileService,
    private route: ActivatedRoute,
    private editor: EditorService,
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
      this.muteCore = new MuteCore(42)
      this.muteCore.joinSource = this.network.onJoin
      this.muteCore.messageSource = this.network.onMessage
      this.muteCore.docService.localTextOperationsSource = this.editor.onLocalTextOperations
      this.network.messageToBroadcastSource = this.muteCore.onMsgToBroadcast
      this.network.messageToSendRandomlySource = this.muteCore.onMsgToSendRandomly
      this.network.messageToSendToSource = this.muteCore.onMsgToSendTo

      this.muteCore.collaboratorsService.peerJoinSource = this.network.onPeerJoin
      this.muteCore.collaboratorsService.peerLeaveSource = this.network.onPeerLeave
      this.muteCore.collaboratorsService.pseudoSource = this.profile.onPseudonym
      this.richCollaboratorsService.collaboratorsSource = this.muteCore.collaboratorsService.collaborators

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
