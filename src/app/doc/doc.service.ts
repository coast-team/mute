import { ChangeDetectorRef, Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  ICollaborator,
  LocalOperation,
  MetaDataType,
  MuteCore,
  Position,
  RemoteOperation,
  RichLogootSOperation,
  State,
  TextDelete,
  TextInsert,
} from '@coast-team/mute-core'
import { KeyState } from '@coast-team/mute-crypto'
import { WebGroupState } from 'netflux'
import { merge, Subscription } from 'rxjs'
import { auditTime, filter, map } from 'rxjs/operators'

import { environment } from '../../environments/environment'
import { CryptoService } from '../core/crypto/crypto.service'
import { Doc } from '../core/Doc'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { UiService } from '../core/ui/ui.service'
import { LogsService } from './logs/logs.service'
import { NetworkService } from './network'
import { RichCollaboratorsService } from './rich-collaborators'

const SAVE_DOC_INTERVAL = 2000
const SYNC_DOC_INTERVAL = 10000

@Injectable()
export class DocService implements OnDestroy {
  private subs: Subscription[]
  private muteCore: MuteCore

  // Intervals
  private saveDocInterval: number | undefined
  private syncDocContentInterval: number | undefined
  private docContentChanged: boolean

  public doc: Doc

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private collabs: RichCollaboratorsService,
    private settings: SettingsService,
    private network: NetworkService,
    private botStorage: BotStorageService,
    public ui: UiService,
    private cd: ChangeDetectorRef,
    private logs: LogsService,
    private crypto: CryptoService
  ) {
    this.subs = []
    this.docContentChanged = false
    this.saveDocInterval = undefined
    this.subs[this.subs.length] = this.settings.onChange
      .pipe(filter((props) => props.includes(EProperties.profile)))
      .subscribe(() => window.location.reload())
    this.zone.runOutsideAngular(() => {
      this.newSub = this.route.data.subscribe(({ doc }: { doc: Doc }) => {
        this.doc = doc

        // Handle bot storage if exist
        this.newSub = this.collabs.onUpdate.subscribe((collab: ICollaborator) => {
          if (collab.login === this.botStorage.login) {
            if (this.doc.remotes.length === 0) {
              this.doc.addRemote(this.botStorage.id)
            }
            this.doc.remotes[0].synchronized = new Date()
          }
        })
        this.newSub = this.network.onStateChange.subscribe((state) => {
          if (state === WebGroupState.JOINED && this.doc.remotes.length !== 0) {
            this.network.inviteBot(this.botStorage.wsURL)
          }
        })

        this.newSub = this.doc.onMetadataChanges.subscribe(() => cd.detectChanges())
      })
    })
  }

  async joinSession() {
    // Read document content from local database and put into MuteCore model
    const docContent = await this.readDocContent()
    // Initialize MuteCore with your profile data, document metadata and content
    this.muteCore = new MuteCore({
      profile: {
        displayName: this.settings.profile.displayName,
        login: this.settings.profile.login,
        email: this.settings.profile.email,
        avatar: this.settings.profile.avatar,
      },
      docContent,
      metaTitle: {
        title: this.doc.title,
        titleModified: this.doc.titleModified.getTime(),
      },
      metaFixData: {
        docCreated: this.doc.created.getTime(),
        cryptoKey: this.doc.cryptoKey,
      },
      metaLogs: {
        share: this.doc.shareLogs,
        vector: this.doc.shareLogsVector,
      },
    })

    this.initLogs()

    // MuteCore model subscribes to LOCAL operations
    this.muteCore.localTextOperations$ = this.doc.localContentChanges.pipe(
      map((ops) => {
        return ops.map(({ offset, text, length }) => {
          this.docContentChanged = true
          return length ? new TextDelete(offset, length) : new TextInsert(offset, text)
        })
      })
    )

    // Subscribe to REMOTE operations
    this.newSub = this.muteCore.remoteTextOperations$.subscribe(({ collaborator, operations }) => {
      this.docContentChanged = true
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

    // Link message stream between Network and MuteCore
    this.muteCore.messageIn$ = this.network.messageOut
    this.network.setMessageIn(this.muteCore.messageOut$)

    // Setup collaborators' subscriptions
    this.collabs.subscribeToUpdateSource(this.muteCore.remoteCollabUpdate$)
    this.collabs.subscribeToJoinSource(this.muteCore.collabJoin$)
    this.collabs.subscribeToLeaveSource(this.muteCore.collabLeave$)
    this.muteCore.memberJoin$ = this.network.onMemberJoin
    this.muteCore.memberLeave$ = this.network.onMemberLeave
    this.muteCore.localCollabUpdate$ = this.settings.onChange.pipe(
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

    // Subscribe to Local and Remote Metadata change
    this.muteCore.localMetadataUpdate$ = merge(
      this.doc.onMetadataChanges.pipe(
        filter(({ isLocal, changedProperties }) => isLocal && changedProperties.includes(Doc.TITLE)),
        map(() => {
          return { type: MetaDataType.Title, data: { title: this.doc.title, titleModified: this.doc.titleModified.getTime() } }
        })
      ),
      this.doc.onMetadataChanges.pipe(
        filter(({ isLocal, changedProperties }) => isLocal && changedProperties.includes(Doc.SHARE_LOGS)),
        map(() => {
          return { type: MetaDataType.Logs, data: { share: this.doc.shareLogs, vector: this.doc.shareLogsVector } }
        })
      )
    )
    this.doc.setRemoteMetadataUpdateSource(this.muteCore.remoteMetadataUpdate$)

    // Subscribe to debugging information
    this.newSub = this.muteCore.digestUpdate$.subscribe((digest: number) => {
      this.ui.updateDocDigest(digest)
      this.cd.detectChanges()
    })
    this.newSub = this.muteCore.treeUpdate$.subscribe((tree: string) => this.ui.updateDocTree(tree))

    // Start interval which saves the document content to the local database
    this.startSaveDocInterval()

    // Subscribe to events which trigger document content synchronization

    this.newSub = merge(
      this.network.onCryptoStateChange.pipe(filter((state) => state === KeyState.READY)),
      this.network.onStateChange.pipe(filter((state) => state === WebGroupState.JOINED))
    )
      .pipe(auditTime(1000))
      .subscribe((v) => this.restartSyncInterval())

    // Config assymetric cryptography
    if (environment.cryptography.coniksClient) {
      this.collabs.onJoin.subscribe(({ id, login }) =>
        this.crypto.verifyLoginPK(id, login).catch((err) => {
          log.info('Failed to retreive Public Key of ' + login)
        })
      )
    }

    // Start join the collaboration session
    this.network.join(this.doc.signalingKey)
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
    window.clearInterval(this.saveDocInterval)
    window.clearInterval(this.syncDocContentInterval)
    this.doc.dispose()
  }

  getDocContent(): State {
    return this.muteCore.state
  }

  indexFromId(pos: any): number {
    return this.muteCore.indexFromId(pos)
  }

  positionFromIndex(index: number): Position {
    return this.muteCore.positionFromIndex(index)
  }

  private initLogs(): void {
    const siteId = this.muteCore.myMuteCoreId

    // For displyaing logs in console

    this.subs.push(
      this.doc.onMetadataChanges.pipe(filter(({ changedProperties }) => changedProperties.includes(Doc.SHARE_LOGS))).subscribe(() => {
        this.logs.setShareLogs(this.doc.shareLogs, this.muteCore.state.vector)
      })
    )

    this.subs.push(
      this.network.onStateChange.pipe(filter((state) => state === WebGroupState.JOINED)).subscribe(() => {
        const obj = { type: 'connection', timestamp: Date.now(), siteId }
        this.logs.log(obj)
      })
    )
    this.subs.push(
      this.network.onLeave.subscribe(() => {
        this.logs.log({ type: 'disconnection', timestamp: Date.now(), siteId })
      })
    )

    this.subs.push(
      this.network.onMemberJoin.subscribe((peer: number) => {
        this.logs.log({ type: 'peerConnection', timestamp: Date.now(), siteId })
      })
    )
    this.subs.push(
      this.network.onMemberLeave.subscribe((peer: number) => {
        this.logs.log({ type: 'peerDisconnection', timestamp: Date.now(), siteId })
      })
    )

    this.subs.push(
      this.muteCore.collabJoin$.subscribe((c: ICollaborator) => {
        this.logs.log({ type: 'collaboratorJoin', timestamp: Date.now(), siteId })
      })
    )
    this.subs.push(
      this.muteCore.collabLeave$.subscribe((c: number) => {
        this.logs.log({ type: 'collaboratorLeave', timestamp: Date.now(), siteId })
      })
    )

    this.subs.push(
      this.muteCore.localOperationForLog$.subscribe((operation: LocalOperation) => {
        this.logs.log({
          ...operation,
          timestamp: Date.now(),
          collaborators: this.network.members,
          neighbours: this.network.wg.neighbors,
        })
      })
    )

    this.subs.push(
      this.muteCore.remoteOperationForLog.subscribe((operation: RemoteOperation) => {
        this.logs.log({
          ...operation,
          timestamp: Date.now(),
          collaborators: this.network.members,
          neighbours: this.network.wg.neighbors,
        })
      })
    )
  }

  private restartSyncInterval() {
    window.clearInterval(this.syncDocContentInterval)
    this.sync()
    this.syncDocContentInterval = window.setInterval(() => this.sync(), SYNC_DOC_INTERVAL)
  }

  private sync() {
    if (this.network.members.length > 1 && this.network.cryptoState === KeyState.READY) {
      this.muteCore.synchronize()
    }
  }

  private async readDocContent(): Promise<State> {
    try {
      const state = (await this.doc.fetchContent()) as State
      const richLogootSOps = state.richLogootSOps
        .map((richLogootSOp) => RichLogootSOperation.fromPlain(richLogootSOp))
        .filter((richLogootSOp) => richLogootSOp instanceof RichLogootSOperation)
      return new State(new Map(), richLogootSOps)
    } catch {
      return new State(new Map(), [])
    }
  }

  private startSaveDocInterval() {
    this.saveDocInterval = window.setInterval(() => {
      if (this.docContentChanged) {
        this.doc.saveContent(this.muteCore.state).catch((err) => log.warn('Failed save document content to database: ', err))
      } else {
        this.docContentChanged = false
      }
    }, SAVE_DOC_INTERVAL)
  }

  private set newSub(s: Subscription) {
    this.subs[this.subs.length] = s
  }
}
