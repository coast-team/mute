import { ChangeDetectorRef, Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { merge, Observable, Subject, Subscription } from 'rxjs'
import { auditTime, filter, map } from 'rxjs/operators'

import {
  ICollaborator,
  LocalOperation,
  RemoteOperation,
  MetaDataType,
  MuteCoreFactory,
  MuteCoreTypes,
  Position,
  StateStrategy,
  StateTypes,
  TextDelete,
  TextInsert,
} from '@coast-team/mute-core'
import { SessionParameters } from '@coast-team/mute-core/dist/types/src/MuteCore'
import { KeyState } from '@coast-team/mute-crypto'

import { environment } from '@environments/environment'
import { CryptoService } from '@app/core/crypto'
import { Doc } from '@app/core/Doc'
import { EProperties } from '@app/core/settings/EProperties.enum'
import { SettingsService } from '@app/core/settings'
import { BotStorageService } from '@app/core/storage/bot'
import { UiService } from '@app/core/ui/ui.service'
import { DocResolverService } from './doc-resolver.service'
import { LogsService } from './logs'
import { NetworkServiceAbstracted, PeersGroupConnectionStatus } from '@app/doc/network/network.service.abstracted'
import { RichCollaboratorsService } from './rich-collaborators/rich-collaborators.service'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'

const SAVE_DOC_INTERVAL = 2000
const SYNC_DOC_INTERVAL = 10000

@Injectable()
export class DocService implements OnDestroy {
  public doc: Doc

  private subs: Subscription[]
  private muteCore: MuteCoreTypes

  // Intervals
  private saveDocInterval: number | undefined
  private syncDocContentInterval: number | undefined
  private docContentChanged: boolean
  private initSubject$: Subject<string>

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private collabs: RichCollaboratorsService,
    private settings: SettingsService,
    private network: NetworkServiceAbstracted,
    private botStorage: BotStorageService,
    public ui: UiService,
    private cd: ChangeDetectorRef,
    private logs: LogsService,
    private crypto: CryptoService,
    private docResolver: DocResolverService
  ) {
    this.subs = []
    this.docContentChanged = false
    this.saveDocInterval = undefined
    this.initSubject$ = new Subject()
    this.subs[this.subs.length] = this.settings.onChange
      .pipe(filter((props) => props.includes(EProperties.profile)))
      .subscribe(() => window.location.reload())

    /*
     * We have NgZone imported in this module and injected its instance
     * by Angular (see constructor property).
     * We run the following code what we call outside of Angular zone,
     * because we do not want Angular detect any modification done inside
     * CodeMirror and manage it ourselves.
     * Q. Why this?
     * A. To understand well a more detailed comprehension of Angular
     * detect changes mechanism is mandatory, but in two words
     * if we do not do it, we will have a performance issue,
     * as Angular would run detectChanges mechanism infinitely.
     */
    this.zone.runOutsideAngular(() => {
      this.newSub = this.route.data.subscribe(({ doc }: { doc: Doc }) => {
        this.doc = doc

        // BEGIN: Handle bot storage if exists
        this.newSub = this.collabs.onUpdate.subscribe((collab: ICollaborator) => {
          if (collab.login === this.botStorage.login) {
            if (this.doc.remotes.length === 0) {
              this.doc.addRemote(this.botStorage.id)
            }
            this.doc.remotes[0].synchronized = new Date()
          }
        })
        /* TODO code that needs to be re-evaluated for Bot functionality
        this.newSub = this.network.onStateChange.subscribe((state) => {
          if (state === WebGroupState.JOINED && this.doc.remotes.length !== 0) {
            this.network.inviteBot(this.botStorage.wsURL)
          }
        })*/

        this.newSub = this.doc.onMetadataChanges.subscribe(() => cd.detectChanges())
        // END: Handle bot storage if exists
      })
    })

    if (environment.pulsar) {
      this.logs.setStreamLogsPulsar(this.network.pulsarService)
    }
  }

  async joinSession() {
    // Read document content from local database and put into MuteCore model
    const docContent = await this.readDocContent()
    this.route.paramMap.subscribe((params) => {
      this.doc.pulsar = this.doc.pulsar || params.get('pulsar') === 'true' ? true : false
    })

    // Initialize MuteCore with your profile data, document metadata and content
    const muteCoreOptions: SessionParameters = {
      strategy: environment.crdtStrategy,
      profile: {
        displayName: this.settings.profile.displayName,
        login: this.settings.profile.login,
        email: this.settings.profile.email,
        avatar: this.settings.profile.avatar,
        deviceID: this.settings.profile.deviceID,
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
      metaPulsar: {
        activatePulsar: this.doc.pulsar,
      },
    }
    this.muteCore = MuteCoreFactory.createMuteCore(muteCoreOptions)

    this.initLogs()

    // MuteCore model subscribes to LOCAL operations
    this.muteCore.localTextOperations$ = this.doc.localContentChanges.pipe(
      map((ops) => {
        return ops.map(({ index, text, length }) => {
          this.docContentChanged = true
          return length
            ? new TextDelete(index, length, this.muteCore.myMuteCoreId)
            : new TextInsert(index, text, this.muteCore.myMuteCoreId)
        })
      })
    )

    // Subscribe to REMOTE operations
    this.newSub = this.muteCore.remoteTextOperations$.subscribe(({ collaborator, operations }) => {
      this.docContentChanged = true
      this.doc.remoteContentChanges.next(
        operations.map((op) => {
          if (op instanceof TextInsert) {
            return { collaborator, index: op.index, text: op.content }
          } else if (op instanceof TextDelete) {
            return { collaborator, index: op.index, length: op.length }
          }
        })
      )
    })

    // Link message stream between Network and MuteCore
    this.muteCore.messageIn$ = this.network.messageIn
    this.network.setMessageOut(this.muteCore.messageOut$)

    //Set up the network to be used in the collaboratorService
    this.collabs.setNetwork(this.network)
    this.collabs.setMuteCore(this.muteCore)

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
            id: this.network.solution.myNetworkId,
            displayName: this.settings.profile.displayName,
            login: this.settings.profile.login,
            email: this.settings.profile.email,
            avatar: this.settings.profile.avatar,
          }
        } else {
          return { id: this.network.solution.myNetworkId, displayName: this.settings.profile.displayName }
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
      ),
      this.doc.onMetadataChanges.pipe(
        filter(({ isLocal, changedProperties }) => isLocal && changedProperties.includes(Doc.PULSAR)),
        map(() => {
          return { type: MetaDataType.Pulsar, data: { activatePulsar: this.doc.pulsar } }
        })
      )
    )
    this.doc.setRemoteMetadataUpdateSource(this.muteCore.remoteMetadataUpdate$)

    //Updating the digest in the UI whenever we open a document
    this.ui.updateDocDigest(this.getDigest())

    // Subscribe to debugging information
    this.newSub = this.muteCore.digestUpdate$.subscribe((digest: number) => {
      this.ui.updateDocDigest(digest)
      this.cd.detectChanges()
    })

    // Start interval which saves the document content to the local database
    this.startSaveDocInterval()

    // Subscribe to events which trigger document content synchronization
    this.handleSynchronizationActivation()

    // Config assymetric cryptography
    if (environment.cryptography.coniksClient) {
      this.collabs.onJoin.subscribe(({ networkId, login }) =>
        this.crypto.verifyLoginPKConiks(networkId, login).catch((err) => {
          log.info('Failed to retreive Public Key of ' + login)
        })
      )
    } else if (environment.cryptography.keyserver) {
      this.collabs.onJoin.subscribe(({ networkId, login, deviceID }) => {
        return this.crypto.verifyLoginPK(networkId, login, deviceID).catch((err) => {
          log.info('Failed to retreive Public Key of ' + login)
        })
      })
    }
    // Start join the collaboration session
    this.network.joinNetwork(this.doc.signalingKey)
  }

  /**
   * enable the MuteCore synchronization under specific conditions
   */
  handleSynchronizationActivation() {
    if (environment.cryptography.type !== EncryptionType.NONE) {
      this.newSub = merge(
        this.network.onCryptoStateChange.pipe(filter((state) => state === KeyState.READY)),
        this.network.onPeersGroupConnectionStatusChange.pipe(filter((status) => status === PeersGroupConnectionStatus.JOINED))
      )
        .pipe(auditTime(1000))
        .subscribe((v) => this.restartSyncInterval())
    } else {
      setInterval(() => {
        this.restartSyncInterval()
      }, 1000)
    }
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
    window.clearInterval(this.saveDocInterval)
    window.clearInterval(this.syncDocContentInterval)
    this.doc.dispose()
  }

  getDocContent(): StateTypes {
    return this.muteCore.state
  }

  indexFromId(pos: any): number {
    return this.muteCore.indexFromId(pos)
  }

  positionFromIndex(index: number): Position {
    return this.muteCore.positionFromIndex(index)
  }

  getDigest(): number {
    return this.muteCore.getDigest()
  }

  private initLogs(): void {
    const siteId = this.muteCore.myMuteCoreId

    // For displyaing logs in console

    this.subs.push(
      this.doc.onMetadataChanges.pipe(filter(({ changedProperties }) => changedProperties.includes(Doc.SHARE_LOGS))).subscribe(() => {
        this.logs.setShareLogs(this.doc.shareLogs, this.muteCore.state.vector)
      })
    )

    if (this.docResolver.isCreate) {
      this.logs.log({ type: 'creation', timestamp: Date.now(), siteId, documentId: this.doc.signalingKey })
    } else {
      this.logs.log({ type: 'opening', timestamp: Date.now(), siteId, documentId: this.doc.signalingKey })
    }

    this.subs.push(
      this.network.onPeersGroupConnectionStatusChange
        .pipe(filter((status) => status === PeersGroupConnectionStatus.JOINED))
        .subscribe(() => {
          const obj = {
            type: 'connection',
            timestamp: Date.now(),
            siteId,
            networkId: this.network.solution.myNetworkId,
            neighbours: {
              downstream: this.network.solution.neighbors,
              upstream: this.network.solution.neighbors,
            },
          }
          this.logs.log(obj)
        })
    )
    this.subs.push(
      this.network.onLeave.subscribe(() => {
        this.logs.log({
          type: 'disconnection',
          timestamp: Date.now(),
          siteId,
          networkId: this.network.solution.myNetworkId,
          neighbours: {
            downstream: this.network.solution.neighbors,
            upstream: this.network.solution.neighbors,
          },
        })
      })
    )

    this.subs.push(
      this.network.onMemberJoin.subscribe((peer: number) => {
        this.logs.log({ type: 'peerConnection', timestamp: Date.now(), siteId, remoteNetworkId: peer })
      })
    )
    this.subs.push(
      this.network.onMemberLeave.subscribe((peer: number) => {
        this.logs.log({ type: 'peerDisconnection', timestamp: Date.now(), siteId, remoteNetworkId: peer })
      })
    )

    this.subs.push(
      this.muteCore.collabJoin$.subscribe((c: ICollaborator) => {
        this.logs.log({ type: 'collaboratorJoin', timestamp: Date.now(), siteId, remoteSiteId: c.muteCoreId })
      })
    )
    this.subs.push(
      this.muteCore.collabLeave$.subscribe((c: ICollaborator) => {
        this.logs.log({ type: 'collaboratorLeave', timestamp: Date.now(), siteId, remoteSiteId: c.muteCoreId })
      })
    )

    this.subs.push(
      (this.muteCore.localOperationForLog$ as Observable<LocalOperation<any>>).subscribe({
        next: (operation) => {
          this.logs.log({
            ...operation,
            timestamp: Date.now(),
            collaborators: this.network.groupOfCollaborators,
            neighbours: {
              downstream: this.network.solution.neighbors,
              upstream: this.network.solution.neighbors,
            },
          })
        },
      })
    )

    this.subs.push(
      (this.muteCore.remoteOperationForLog as Observable<RemoteOperation<any>>).subscribe((operation) => {
        const opes = []
        operation.textOperation.forEach((ope) => {
          if (ope instanceof TextInsert) {
            const o = ope as TextInsert
            opes.push({ position: o.index, content: o.content, length: o.content.length })
          } else if (ope instanceof TextDelete) {
            const o = ope as TextDelete
            opes.push({ position: o.index, length: o.length })
          }
        })
        const reworkOpe = { ...operation }
        reworkOpe.textOperation = opes
        this.logs.log({
          ...reworkOpe,
          timestamp: Date.now(),
          collaborators: this.network.groupOfCollaborators,
          neighbours: {
            downstream: this.network.solution.neighbors,
            upstream: this.network.solution.neighbors,
          },
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
    if (environment.cryptography.type !== EncryptionType.NONE) {
      if (this.network.cryptoState === KeyState.READY) {
        // if (this.network.members.length > 1 && this.network.cryptoState === KeyState.READY) {
        this.muteCore.synchronize()
      }
    } else {
      this.muteCore.synchronize()
    }
  }

  private async readDocContent(): Promise<StateTypes> {
    try {
      const state = await this.doc.fetchContent()
      if (!(state instanceof Blob)) {
        const str = StateStrategy.getStr(state)
        if (str !== undefined) {
          this.initSubject$.next(str)
          return state
        }
      }
    } catch {
      return StateStrategy.emptyState(environment.crdtStrategy)
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

  public get initSubject(): Observable<string> {
    return this.initSubject$.asObservable()
  }
}
