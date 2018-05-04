import { Component, Injectable, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MuteCore } from 'mute-core'
import { merge } from 'rxjs/observable/merge'
import { filter, map } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import * as mnemonic from '@coast-team/mnemonicjs'
import { SymmetricCryptoService } from '../core/crypto/symmetric-crypto.service'
import { Doc } from '../core/Doc'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
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
    public ui: UiService,
    private symCrypto: SymmetricCryptoService
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
          this.muteCore.collaboratorsService.messageSource = this.network.onMessage
          const newOnMessage = new Subject<any>()

          this.muteCore.syncMessageService.messageSource = newOnMessage.asObservable()

          this.network.onMessage.pipe(
            filter((msg) => msg.service === 'SyncMessage')
          ).subscribe((msg) => {
            this.symCrypto
              .decrypt(msg.content)
              .then((content) => {
                console.log('Msg (' + msg.content.byteLength + ' bytes) to decrypt : ', mnemonic.encode(msg.content))
                console.log('Msg (' + content.byteLength + ' bytes) decrypted : ', mnemonic.encode(content))
                newOnMessage.next(Object.assign({}, msg, { content }))
              })
          })
          this.network.initSource = this.muteCore.onInit
          const newBroadcast = new Subject<any>()
          this.network.messageToBroadcastSource = merge(
            this.muteCore.collaboratorsService.onMsgToBroadcast,
            newBroadcast

          ) as any
          this.muteCore.syncMessageService.onMsgToBroadcast.subscribe((msg) => {
            this.symCrypto
              .encrypt(msg.content)
              .then((content) => {
                console.log('Msg (' + msg.content.byteLength + ' bytes) to encrypt : ' + mnemonic.encode(msg.content))
                console.log('Msg (' + content.byteLength + ' bytes) encrypted : ', mnemonic.encode(content))
                newBroadcast.next(Object.assign({}, msg, { content }))
              })
          })
          this.network.messageToSendRandomlySource = merge(
            this.muteCore.collaboratorsService.onMsgToSendRandomly,
            this.muteCore.syncMessageService.onMsgToSendRandomly.pipe(
              map((msg) => {
                console.log('(Randomly) Msg sent : ', msg.service)

                return this.symCrypto
                  .encrypt(msg.content)
                  .then((content) => Object.assign({}, msg, { content }))
              })
            )
          ) as any
          this.network.messageToSendToSource = merge(
            this.muteCore.collaboratorsService.onMsgToSendTo,
            this.muteCore.syncMessageService.onMsgToSendTo.pipe(
              map((msg) => {
                console.log('(SendTo) Msg sent : ', msg.service)

                return this.symCrypto
                  .encrypt(msg.content)
                  .then((content) => Object.assign({}, msg, { content }))
              })
            )
          ) as any

          this.richCollaboratorsService.pseudoChangeSource = this.muteCore.collaboratorsService.onCollaboratorChangePseudo
          this.richCollaboratorsService.joinSource = this.muteCore.collaboratorsService.onCollaboratorJoin
          this.richCollaboratorsService.leaveSource = this.muteCore.collaboratorsService.onCollaboratorLeave
          this.muteCore.collaboratorsService.peerJoinSource = this.network.onPeerJoin
          this.muteCore.collaboratorsService.peerLeaveSource = this.network.onPeerLeave
          this.muteCore.collaboratorsService.pseudoSource = this.settings.onChange.pipe(
            filter(
              (props) =>
                props.includes(EProperties.profile) ||
                props.includes(EProperties.profileDisplayName)
            ),
            map(() => this.settings.profile.displayName)
          )

          this.muteCore.syncService.setJoinAndStateSources(
            this.network.onJoin,
            this.syncStorage.onStoredState
          )
          this.syncStorage.initSource = this.muteCore.onInit.pipe(
            map(() => this.doc)
          )
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
      }
    )
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
