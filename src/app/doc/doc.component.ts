import { Component, Injectable, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { ActivatedRoute } from '@angular/router'
import { MuteCore } from 'mute-core'
import { Subscription } from 'rxjs/Rx'

import { Doc } from '../core/Doc'
import { ProfileService } from '../core/profile/profile.service'
import { BotStorageService } from '../core/storage/bot-storage/bot-storage.service'
import { UiService } from '../core/ui/ui.service'
import { NetworkService } from '../doc/network'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { SyncStorageService } from '../doc/sync/sync-storage.service'

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [ RichCollaboratorsService, SyncStorageService ]
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {

  @ViewChild('sidenavElm') sidenavElm
  @ViewChild('rightSidenavElm') rightSidenavElm
  @ViewChild('leftSidenavElm') leftSidenavElm
  public doc: Doc
  private mediaSubscription: Subscription
  private networkSubscription: Subscription
  private activeMediaQuery: string
  private inited = false

  public muteCore: MuteCore
  public rightSideNavMode = 'side'

  constructor (
    private zone: NgZone,
    private route: ActivatedRoute,
    private richCollaboratorsService: RichCollaboratorsService,
    private profile: ProfileService,
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    private botStorage: BotStorageService,
    public ui: UiService,
    public media: ObservableMedia
  ) {
    this.doc = new Doc('', '', '')
    log.debug('Init DOC: ', this.doc)
  }

  ngOnInit () {
    if (this.inited) {
      this.network.clean()
      this.muteCore.dispose()
    }
    this.network.init()

    this.mediaSubscription = this.media.asObservable().subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : ''
      if ( change.mqAlias === 'xs') {
        this.rightSideNavMode = 'over'
      }
    })

    this.ui.onNavToggle.subscribe(() => {
      this.leftSidenavElm.opened = !this.leftSidenavElm.opened
    })

    this.ui.onDocNavToggle.subscribe(() => {
      this.rightSidenavElm.opened = !this.rightSidenavElm.opened
    })

    this.route.data.subscribe(({ file }: { file: Doc }) => {
      this.doc = file
      log.debug('Route DOC: ', this.doc)
      this.networkSubscription = this.network.onJoin.subscribe(() => {
        if (this.doc.botStorages.length !== 0) {
          this.network.inviteBot(this.doc.botStorages[0].wsURL)
        } else {
          this.botStorage.whichExist([this.doc.key])
            .then((existedKeys) => {
              if (existedKeys.includes(this.doc.key)) {
                this.network.inviteBot(this.botStorage.bot.wsURL)
              }
            })
        }
      })

      // TODO: Retrieve previous id for this document if existing
      const ids = new Int32Array(1)
      global.window.crypto.getRandomValues(ids)
      const id = ids[0]

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
        this.syncStorage.initSource = this.muteCore.onInit.map(() => this.doc)
        this.syncStorage.stateSource = this.muteCore.syncService.onState

        this.muteCore.docService.onDocDigest.subscribe((digest: number) => {
          this.ui.digest = digest
        })

        this.muteCore.docService.onDocTree.subscribe((tree: string) => {
          this.ui.tree = tree
        })
      })
    })
  }

  ngOnDestroy () {
    this.network.clean()
    this.muteCore.dispose()
    this.mediaSubscription.unsubscribe()
  }

  editorReady (): void {
    this.muteCore.init(this.doc.key)
    this.inited = true
  }

}
