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
        log.debug('Resolver gives: ', data)
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

      // TODO: Retrieve previous id for this document if existing
      const ids = new Int32Array(1)
      window.crypto.getRandomValues(ids)
      const id: number = ids[0]

      this.muteCore = new MuteCore(id)
      this.muteCore.messageSource = this.network.onMessage
      this.network.initSource = this.muteCore.onInit
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
      this.syncStorage.initSource = this.muteCore.onInit
      this.syncStorage.stateSource = this.muteCore.syncService.onState

      this.muteCore.init(key)
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
