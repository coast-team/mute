import { ChangeDetectorRef, Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  ICollaborator,
  JoinEvent,
  LocalOperation,
  MetaDataType,
  MuteCore,
  Position,
  RemoteOperation,
  State,
  TextDelete,
  TextInsert,
} from 'mute-core'
import { merge, Subject, Subscription } from 'rxjs'
import { filter, flatMap, map } from 'rxjs/operators'

import { environment } from '../../environments/environment'
import { SymmetricCryptoService } from '../core/crypto/symmetric-crypto.service'
import { Doc } from '../core/Doc'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { UiService } from '../core/ui/ui.service'
import { NetworkService } from '../doc/network'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { SyncStorageService } from '../doc/sync/sync-storage.service'
import { LogsService } from './logs/logs.service'

@Injectable()
export class DocService implements OnDestroy {
  private subs: Subscription[]
  private muteCore: MuteCore
  private cryptoReady: Subject<void>

  public doc: Doc
  public logs: LogsService

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private collabs: RichCollaboratorsService,
    private settings: SettingsService,
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    private botStorage: BotStorageService,
    public ui: UiService,
    private symCrypto: SymmetricCryptoService,
    private cd: ChangeDetectorRef
  ) {
    this.subs = []
    this.cryptoReady = new Subject()
    this.zone.runOutsideAngular(() => {
      this.subs[this.subs.length] = this.route.data.subscribe(({ doc }: { doc: Doc }) => {
        this.doc = doc

        // Add bot storage if exist
        this.subs[this.subs.length] = this.collabs.onUpdate.subscribe((collab: ICollaborator) => {
          if (collab.login === this.botStorage.login) {
            if (this.doc.remotes.length === 0) {
              this.doc.addRemote(this.botStorage.id)
            }
            this.doc.remotes[0].synchronized = new Date()
          }
        })
        this.subs[this.subs.length] = this.network.onJoin.subscribe(() => {
          if (this.doc.remotes.length !== 0) {
            this.network.inviteBot(this.botStorage.wsURL)
          }
        })

        // Initialize Network
        this.network.init()

        // Initialize MuteCore
        this.initMuteCore()

        this.subs[this.subs.length] = this.doc.onMetadataChanges.subscribe(() => cd.detectChanges())
      })
    })
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
    this.doc.dispose()
  }

  getDocContent(): State {
    return this.muteCore.syncService.state
  }

  indexFromId(pos: any): number {
    return this.muteCore.docService.indexFromId(pos)
  }

  positionFromIndex(index: number): Position {
    return this.muteCore.docService.positionFromIndex(index)
  }

  editorReady() {
    this.muteCore.init(this.doc.signalingKey)
  }

  private initMuteCore() {
    this.muteCore = new MuteCore({
      profile: {
        displayName: this.settings.profile.displayName,
        login: this.settings.profile.login,
        email: this.settings.profile.email,
        avatar: this.settings.profile.avatar,
      },
      metaTitle: {
        title: this.doc.title,
        titleModified: this.doc.titleModified.getTime(),
      },
      metaFixData: {
        docCreated: this.doc.created.getTime(),
        cryptoKey: this.doc.cryptoKey,
      },
    })

    // Subscribe to LOCAL document content changes
    this.muteCore.docService.localTextOperationsSource = this.doc.localContentChanges.pipe(
      map((ops) => {
        return ops.map(({ offset, text, length }) => {
          return length ? new TextDelete(offset, length) : new TextInsert(offset, text)
        })
      })
    )

    // Emit REMOTE document content changes
    this.subs[this.subs.length] = this.muteCore.docService.onRemoteTextOperations.subscribe(({ collaborator, operations }) => {
      this.doc.remoteContentChanges.next(
        operations.map((op) => {
          if (op instanceof TextInsert) {
            return { collaborator, offset: op.offset, text: op.content }
          } else if (op instanceof TextDelete) {
            return { collaborator, offset: op.offset, length: op.length }
          }
        })
      )
    })

    this.network.initSource = this.muteCore.onInit

    if (environment.encryption) {
      this.withEncryption()
    } else {
      this.withoutEncryption()
    }

    this.collabs.subscribeToUpdateSource(this.muteCore.collaboratorsService.onUpdate)
    this.collabs.subscribeToJoinSource(this.muteCore.collaboratorsService.onJoin)
    this.collabs.subscribeToLeaveSource(this.muteCore.collaboratorsService.onLeave)
    this.muteCore.collaboratorsService.joinSource = this.network.onPeerJoin
    this.muteCore.collaboratorsService.leaveSource = this.network.onPeerLeave
    this.muteCore.collaboratorsService.updateSource = this.settings.onChange.pipe(
      filter((props) => props.includes(EProperties.profile) || props.includes(EProperties.profileDisplayName)),
      map((props) => {
        if (props.includes(EProperties.profile)) {
          return {
            id: this.network.myId,
            displayName: this.settings.profile.displayName,
            login: this.settings.profile.login,
            email: this.settings.profile.email,
            avatar: this.settings.profile.avatar,
          }
        } else {
          return { id: this.network.myId, displayName: this.settings.profile.displayName }
        }
      })
    )

    this.syncStorage.initSource = this.muteCore.onInit.pipe(map(() => this.doc))
    this.syncStorage.stateSource = this.muteCore.syncService.onState

    this.muteCore.syncService.setJoinAndStateSources(this.network.onJoin, this.cryptoReady, this.syncStorage.onStoredState)
    this.muteCore.metaDataService.onLocalChange = this.doc.onMetadataChanges.pipe(
      filter(({ isLocal, changedProperties }) => isLocal && changedProperties.includes(Doc.TITLE)),
      map(() => {
        return { type: MetaDataType.Title, data: { title: this.doc.title, titleModified: this.doc.titleModified.getTime() } }
      })
    )
    this.muteCore.metaDataService.joinSource = this.network.onPeerJoin
    this.doc.setRemoteMetadataUpdateSource(this.muteCore.metaDataService.onChange)

    this.subs[this.subs.length] = this.muteCore.docService.onDocDigest.subscribe((digest: number) => {
      this.ui.updateDocDigest(digest)
      this.cd.detectChanges()
    })

    this.subs[this.subs.length] = this.muteCore.docService.onDocTree.subscribe((tree: string) => this.ui.updateDocTree(tree))
  }

  private initLogs(): void {
    const siteId = this.muteCore.collaboratorsService.me.muteCoreId
    this.logs = new LogsService('muteLogs-' + this.doc.signalingKey)
    this.logs.setDisplayLogs(this.settings.displayLogs)

    // For displyaing logs in console
    this.subs.push(
      this.settings.onChange.pipe(filter((properties) => properties.includes(EProperties.displayLogs))).subscribe(() => {
        this.logs.setDisplayLogs(this.settings.displayLogs)
      })
    )

    this.subs.push(
      this.network.onJoin.subscribe((event: JoinEvent) => {
        const obj = { type: 'connection', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )
    this.subs.push(
      this.network.onLeave.subscribe(() => {
        const obj = { type: 'disconnection', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )

    this.subs.push(
      this.network.onPeerJoin.subscribe((peer: number) => {
        const obj = { type: 'peerConnection', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )
    this.subs.push(
      this.network.onPeerLeave.subscribe((peer: number) => {
        const obj = { type: 'peerDisconnection', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )

    this.subs.push(
      this.muteCore.collaboratorsService.onJoin.subscribe((c: ICollaborator) => {
        const obj = { type: 'collaboratorJoin', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )
    this.subs.push(
      this.muteCore.collaboratorsService.onLeave.subscribe((c: number) => {
        const obj = { type: 'collaboratorLeave', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )

    this.subs.push(
      this.muteCore.onLocalOperation.subscribe((operation: LocalOperation) => {
        const obj = {
          ...operation,
          timestamp: Date.now(),
          collaborators: this.network.members,
          neighbours: 'TODO',
        }
        this.logs.log(obj)
      })
    )

    this.subs.push(
      this.muteCore.onRemoteOperation.subscribe((operation: RemoteOperation) => {
        const obj = {
          ...operation,
          timestamp: Date.now(),
          collaborators: this.network.members,
          neighbours: 'TODO',
        }
        this.logs.log(obj)
      })
    )
  }

  private withEncryption() {
    this.muteCore.collaboratorsService.messageSource = this.network.onMessage
    this.muteCore.metaDataService.messageSource = this.network.onMessage

    this.network.messageToBroadcastSource = merge(
      this.muteCore.collaboratorsService.onMsgToBroadcast,
      this.muteCore.metaDataService.onMsgToBroadcast
    )

    this.network.messageToSendRandomlySource = merge(
      this.muteCore.collaboratorsService.onMsgToSendRandomly,
      this.muteCore.metaDataService.onMsgToSendRandomly
    )

    this.network.messageToSendToSource = merge(
      this.muteCore.collaboratorsService.onMsgToSendTo,
      this.muteCore.metaDataService.onMsgToSendTo
    )

    // When the encryption key is synchronised
    this.subs[this.subs.length] = this.doc.onMetadataChanges
      .pipe(filter(({ isLocal, changedProperties }) => !isLocal && changedProperties.includes(Doc.CRYPTO_KEY)))
      .subscribe(() => {
        if (environment.encryption) {
          this.symCrypto.importKey(this.doc.cryptoKey).then(() => {
            this.muteCore.syncMessageService.messageSource = this.network.onMessage.pipe(
              filter(({ service }) => service === 423),
              flatMap((msg) => {
                return this.symCrypto.decrypt(msg.content).then((content) => Object.assign({}, msg, { content }))
              })
            )

            this.network.messageToBroadcastSource = merge(
              this.muteCore.collaboratorsService.onMsgToBroadcast,
              this.muteCore.metaDataService.onMsgToBroadcast,
              this.muteCore.syncMessageService.onMsgToBroadcast.pipe(
                flatMap((msg) => this.symCrypto.encrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
              )
            )

            this.network.messageToSendRandomlySource = merge(
              this.muteCore.collaboratorsService.onMsgToSendRandomly,
              this.muteCore.metaDataService.onMsgToSendRandomly,
              this.muteCore.syncMessageService.onMsgToSendRandomly.pipe(
                flatMap((msg) => this.symCrypto.encrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
              )
            )

            this.network.messageToSendToSource = merge(
              this.muteCore.collaboratorsService.onMsgToSendTo,
              this.muteCore.metaDataService.onMsgToSendTo,
              this.muteCore.syncMessageService.onMsgToSendTo.pipe(
                flatMap((msg) => this.symCrypto.encrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
              )
            )

            this.cryptoReady.next()
            this.cryptoReady.complete()
          })
        }
      })
  }

  private withoutEncryption() {
    this.muteCore.messageSource = this.network.onMessage

    this.network.messageToBroadcastSource = this.muteCore.onMsgToBroadcast

    this.network.messageToSendRandomlySource = this.muteCore.onMsgToSendRandomly

    this.network.messageToSendToSource = this.muteCore.onMsgToSendTo
  }
}
