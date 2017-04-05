import { Component, Injectable, OnDestroy, OnInit, ViewChild, NgZone } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { Subscription } from 'rxjs/Rx'
import { MuteCore } from 'mute-core'

import { Doc } from '../core/Doc'
import { ProfileService } from '../core/profile/profile.service'
import { NetworkService } from '../doc/network'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { SyncStorageService } from '../doc/sync/sync-storage.service'
import { UiService } from '../core/ui/ui.service'
import { BotStorageService } from '../core/storage'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [ RichCollaboratorsService, SyncStorageService ]
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {

  private doc: Doc
  private key: string
  private mediaSubscription: Subscription
  private activeMediaQuery: string

  @ViewChild('rightSidenavElm') rightSidenavElm
  @ViewChild('leftSidenavElm') leftSidenavElm
  private inited = false

  public muteCore: MuteCore
  public rightSideNavMode = 'side'

  constructor (
    private zone: NgZone,
    private route: ActivatedRoute,
    private richCollaboratorsService: RichCollaboratorsService,
    private profile: ProfileService,
    private botStorage: BotStorageService,
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    public ui: UiService,
    public media: ObservableMedia
  ) {}

  ngOnInit () {
    log.angular('DocComponent init')
    log.debug('SIDENAV', this.rightSidenavElm)
    this.mediaSubscription = this.media.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : ''
      if ( change.mqAlias === 'xs') {
        this.rightSideNavMode = 'over'
      }
    })

    this.route.data
      .subscribe((data: {doc: Doc}) => {
        this.doc = data.doc
        this.network.onJoin.subscribe(() => {
          this.doc.botIds.map((botId) => {
            return this.botStorage.getBotContact(botId)
          })
          .filter((botContact) => botContact !== undefined)
          .forEach((botContact) => {
            log.debug('Inviting: ', botContact.p2pURL)
            this.network.inviteBot(botContact.p2pURL)
          })
        })
      })

    this.ui.onNavToggle.subscribe(() => {
      this.leftSidenavElm.opened = !this.leftSidenavElm.opened
    })

    this.ui.onDocNavToggle.subscribe(() => {
      this.rightSidenavElm.opened = !this.rightSidenavElm.opened
    })

    this.route.params.subscribe((params: Params) => {
      const key = params['key'] // (+) converts string 'id' to a number
      if (this.inited) {
        // Need to clean the services before
        this.network.cleanWebChannel()
        this.muteCore.clean()
      }
      this.key = key
      this.network.initWebChannel()

      // TODO: Retrieve previous id for this document if existing
      const ids = new Int32Array(1)
      window.crypto.getRandomValues(ids)
      const id: number = ids[0]

      this.zone.runOutsideAngular(() => {
        this.muteCore = new MuteCore(id)
        this.muteCore.messageSource = this.network.onMessage
        this.network.initSource = this.muteCore.onInit
        this.network.messageToBroadcastSource = this.muteCore.onMsgToBroadcast
        this.network.messageToSendRandomlySource = this.muteCore.onMsgToSendRandomly
        this.network.messageToSendToSource = this.muteCore.onMsgToSendTo

        this.richCollaboratorsService.pseudoChangeSource = this.muteCore.collaboratorsService.onCollaboratorChangePseudo
        this.richCollaboratorsService.joinSource = this.muteCore.collaboratorsService.onCollaboratorJoin
        this.richCollaboratorsService.leaveSource = this.muteCore.collaboratorsService.onCollaboratorLeave

        this.muteCore.collaboratorsService.peerJoinSource = this.network.onPeerJoin
        this.muteCore.collaboratorsService.peerLeaveSource = this.network.onPeerLeave
        this.muteCore.collaboratorsService.pseudoSource = this.profile.onPseudonym

        this.muteCore.syncService.setJoinAndStateSources(this.network.onJoin, this.syncStorage.onStoredState)
        this.syncStorage.initSource = this.muteCore.onInit.map((key: string) => this.doc)
        this.syncStorage.stateSource = this.muteCore.syncService.onState

        this.muteCore.docService.onDocDigest.subscribe((digest: number) => {
          this.ui.digest = digest
        })
      })

      this.muteCore.docService.onDocTree.subscribe((tree: string) => {
        this.ui.tree = tree
      })
    })
  }

  ngOnDestroy () {
    log.angular('DocComponent destroyed')
    this.network.cleanWebChannel()
    this.muteCore.clean()
    this.mediaSubscription.unsubscribe()
  }

  editorReady (): void {
    this.muteCore.init(this.key)
    this.inited = true
  }

}
