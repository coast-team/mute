import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'

import { ProfileService } from '../core/profile/profile.service'
import { NetworkService } from '../doc/network'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { SyncStorageService } from '../doc/sync/sync-storage.service'
import { UiService } from '../core/ui/ui.service'

import { MuteCore } from 'mute-core'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [ RichCollaboratorsService, SyncStorageService ]
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
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    public ui: UiService
  ) {}

  ngOnInit () {
    this.route.data
      .subscribe((data: {doc: string}) => {
        // log.debug('Resolver gives: ', data)
      })
    this.route.params.subscribe((params: Params) => {
      log.angular('DocComponent init')
      const key = params['key'] // (+) converts string 'id' to a number
      if (this.inited) {
        // Need to clean the services before
        this.network.cleanWebChannel()
        this.muteCore.clean()
      }
      this.network.initWebChannel()
      this.muteCore = new MuteCore(42)
      this.muteCore.joinSource = this.network.onJoin
      this.muteCore.messageSource = this.network.onMessage
      this.network.messageToBroadcastSource = this.muteCore.onMsgToBroadcast
      this.network.messageToSendRandomlySource = this.muteCore.onMsgToSendRandomly
      this.network.messageToSendToSource = this.muteCore.onMsgToSendTo

      this.muteCore.collaboratorsService.peerJoinSource = this.network.onPeerJoin
      this.muteCore.collaboratorsService.peerLeaveSource = this.network.onPeerLeave
      this.muteCore.collaboratorsService.pseudoSource = this.profile.onPseudonym
      this.richCollaboratorsService.collaboratorChangePseudoSource = this.muteCore.collaboratorsService.onCollaboratorChangePseudo
      this.richCollaboratorsService.collaboratorJoinSource = this.muteCore.collaboratorsService.onCollaboratorJoin
      this.richCollaboratorsService.collaboratorLeaveSource = this.muteCore.collaboratorsService.onCollaboratorLeave

      this.muteCore.syncService.setJoinAndStateSources(this.network.onJoin, this.syncStorage.onStoredState)
      this.syncStorage.joinSource = this.network.onJoin
      this.syncStorage.stateSource = this.muteCore.syncService.onState

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
    this.muteCore.clean()
  }

}
