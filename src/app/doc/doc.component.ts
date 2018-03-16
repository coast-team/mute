import { Component, Injectable, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MuteCore } from 'mute-core'
import { filter, map } from 'rxjs/operators'
import { Subscription } from 'rxjs/Subscription'

import { Doc } from '../core/Doc'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
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
  @ViewChild('infoSidenav') infoSidenav

  public doc: Doc
  private subs: Subscription[]
  private inited = false

  public muteCore: MuteCore

  constructor (
    private zone: NgZone,
    private route: ActivatedRoute,
    private richCollaboratorsService: RichCollaboratorsService,
    private settings: SettingsService,
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    private botStorage: BotStorageService,
    public ui: UiService
  ) {
    this.subs = []
  }

  ngOnInit () {
    if (this.inited) {
      this.network.clean()
      this.muteCore.dispose()
    }
    this.network.init()

    this.subs[this.subs.length] = this.route.data
      .subscribe(({ doc }: { doc: Doc }) => {
        this.doc = doc
        this.subs[this.subs.length] = this.network.onJoin.subscribe(() => {
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
        window.crypto.getRandomValues(ids)
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
          this.muteCore.collaboratorsService.pseudoSource = this.settings.onChange.pipe(
            filter((props) => props.includes(EProperties.profile) || props.includes(EProperties.profileDisplayName)),
            map(() => this.settings.profile.displayName)
          )

          this.muteCore.syncService.setJoinAndStateSources(this.network.onJoin, this.syncStorage.onStoredState)
          this.syncStorage.initSource = this.muteCore.onInit.pipe(map(() => this.doc))
          this.syncStorage.stateSource = this.muteCore.syncService.onState

          this.muteCore.docService.onDocDigest.subscribe((digest: number) => {
            this.ui.digest = digest
          })

          this.muteCore.docService.onDocTree.subscribe((tree: string) => {
            this.ui.tree = tree
          })
          // FIXME: rid of calling resendNotification method
          this.settings.resendNotification()
        })
      })
  }

  ngOnDestroy () {
    this.network.clean()
    this.muteCore.dispose()
    this.subs.forEach((s) => s.unsubscribe())
  }

  editorReady (): void {
    this.muteCore.init(this.doc.key)
    this.inited = true
  }

}
