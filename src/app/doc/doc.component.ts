import { BreakpointObserver } from '@angular/cdk/layout'
import { Component, Injectable, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MediaChange, ObservableMedia } from '@angular/flex-layout'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { JoinEvent, MuteCore, State } from 'mute-core'
import { ICollaborator } from 'mute-core/dist/types/collaborators/ICollaborator'
import { LocalOperation } from 'mute-core/dist/types/logs/LocalOperation'
import { RemoteOperation } from 'mute-core/dist/types/logs/RemoteOperation'
import { merge, Observable, ReplaySubject, Subscription } from 'rxjs'
import { filter, flatMap, map } from 'rxjs/operators'

import { environment } from '../../environments/environment'
import { SymmetricCryptoService } from '../core/crypto/symmetric-crypto.service'
import { Doc } from '../core/Doc'
import { EProperties } from '../core/settings/EProperties'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { UiService } from '../core/ui/ui.service'
import { LogsService } from '../doc/logs/logs.service'
import { NetworkService } from '../doc/network'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { SyncStorageService } from '../doc/sync/sync-storage.service'
import { EditorComponent } from './editor/editor.component'

export enum VIEWPORT {
  LARGE,
  MEDIUM,
  SMALL,
  EXTRASMALL,
}

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [RichCollaboratorsService, SyncStorageService],
})
@Injectable()
export class DocComponent implements OnDestroy, OnInit {
  @ViewChild('infoSidenav') infoSidenav

  @ViewChild('editorComponent') editor: EditorComponent

  public doc: Doc
  private subs: Subscription[]
  private inited = false

  public isMobile: boolean
  public muteCore: MuteCore
  public viewport: Observable<VIEWPORT>

  public drawerMode: ReplaySubject<string>
  public drawerOpened: ReplaySubject<boolean>
  public extrasmall: string

  private siteId: number
  public logs: LogsService
  private logsSubs: Subscription[] = []

  public showDevLabel: boolean

  constructor(
    private router: Router,
    private zone: NgZone,
    private route: ActivatedRoute,
    private richCollaboratorsService: RichCollaboratorsService,
    private settings: SettingsService,
    private network: NetworkService,
    private syncStorage: SyncStorageService,
    private botStorage: BotStorageService,
    private media: ObservableMedia,
    public ui: UiService,
    private symCrypto: SymmetricCryptoService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.showDevLabel = environment.devLabel
    this.subs = []
    this.drawerMode = new ReplaySubject()
    this.drawerOpened = new ReplaySubject()
    this.extrasmall = ''
    merge(
      this.breakpointObserver.observe(['(min-width: 1450px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.LARGE)
      ),
      this.breakpointObserver.observe(['(min-width: 1130px) and (max-width: 1450px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.MEDIUM)
      ),
      this.breakpointObserver.observe(['(min-width: 800px) and (max-width: 1130px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.SMALL)
      ),
      this.breakpointObserver.observe(['(max-width: 800px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.EXTRASMALL)
      )
    ).subscribe((viewport) => {
      switch (viewport) {
        case VIEWPORT.LARGE:
          this.drawerMode.next('over')
          this.drawerOpened.next(true)
          this.extrasmall = ''
          break
        case VIEWPORT.MEDIUM:
          this.drawerMode.next('side')
          this.drawerOpened.next(true)
          this.extrasmall = ''
          break
        case VIEWPORT.SMALL:
          this.drawerMode.next('push')
          this.drawerOpened.next(false)
          this.extrasmall = ''
          break
        case VIEWPORT.EXTRASMALL:
          this.drawerMode.next('push')
          this.drawerOpened.next(false)
          this.extrasmall = 'extrasmall'
          break
      }
    })

    this.router.routeReuseStrategy.shouldReuseRoute = () => false
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false
      }
    })
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.media.asObservable().subscribe((change: MediaChange) => {
      this.isMobile = change.mqAlias === 'xs' || change.mqAlias === 'sm'
    })

    this.subs[this.subs.length] = this.richCollaboratorsService.onUpdate.subscribe((collab: ICollaborator) => {
      if (collab.login === this.botStorage.login) {
        if (this.doc.remotes.length === 0) {
          this.doc.addRemote(this.botStorage.id)
        }
        this.doc.remotes[0].synchronized = new Date()
      }
    })
    if (this.inited) {
      this.network.clean()
      this.muteCore.dispose()
    }
    this.network.init()

    this.subs[this.subs.length] = this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      this.doc = doc
      this.subs[this.subs.length] = this.network.onJoin.subscribe(() => {
        if (this.doc.remotes.length !== 0) {
          this.network.inviteBot(this.botStorage.wsURL)
        }
      })

      this.zone.runOutsideAngular(() => {
        this.muteCore = new MuteCore({
          displayName: this.settings.profile.displayName,
          login: this.settings.profile.login,
          email: this.settings.profile.email,
          avatar: this.settings.profile.avatar,
        })
        this.siteId = this.muteCore.collaboratorsService.me.muteCoreId

        this.network.initSource = this.muteCore.onInit

        if (environment.encryption) {
          this.withEncryption()
        } else {
          this.withoutEncryption()
        }

        this.richCollaboratorsService.updateSource = this.muteCore.collaboratorsService.onUpdate
        this.richCollaboratorsService.joinSource = this.muteCore.collaboratorsService.onJoin
        this.richCollaboratorsService.leaveSource = this.muteCore.collaboratorsService.onLeave
        this.muteCore.collaboratorsService.joinSource = this.network.onPeerJoin
        this.muteCore.collaboratorsService.leaveSource = this.network.onPeerLeave
        this.muteCore.collaboratorsService.updateSource = this.settings.onChange.pipe(
          filter((props) => props.includes(EProperties.profile) || props.includes(EProperties.profileDisplayName)),
          map((props) => {
            if (props[EProperties.profile]) {
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

        this.muteCore.syncService.setJoinAndStateSources(this.network.onJoin, this.syncStorage.onStoredState)
        this.syncStorage.initSource = this.muteCore.onInit.pipe(map(() => this.doc))
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

  ngOnDestroy() {
    this.network.clean()
    this.muteCore.dispose()
    this.subs.forEach((s) => s.unsubscribe())
    this.destroyLogs()
  }

  editorReady(): void {
    this.muteCore.init(this.doc.key)
    this.inited = true

    this.initLogs()
  }

  getDocState(): State {
    return this.muteCore.syncService.state
  }

  initLogs(): void {
    this.logs = new LogsService('muteLogs-' + this.doc.key)
    this.logs.setDisplayLogs(this.settings.displayLogs)
    // unsubscribe all subscription if there are some left (in the case you create a document while one is already open)
    if (this.logsSubs.length !== 0) {
      this.destroyLogs()
    }

    // For displyaing logs in console
    this.logsSubs.push(
      this.settings.onChange.pipe(filter((properties) => properties.includes(EProperties.displayLogs))).subscribe(() => {
        this.logs.setDisplayLogs(this.settings.displayLogs)
      })
    )

    this.logsSubs.push(
      this.network.onJoin.subscribe((event: JoinEvent) => {
        const obj = { type: 'connection', timestamp: Date.now(), siteId: this.siteId }
        this.logs.log(obj)
      })
    )
    this.logsSubs.push(
      this.network.onLeave.subscribe(() => {
        const obj = { type: 'disconnection', timestamp: Date.now(), siteId: this.siteId }
        this.logs.log(obj)
      })
    )

    this.logsSubs.push(
      this.network.onPeerJoin.subscribe((peer: number) => {
        const obj = { type: 'peerConnection', timestamp: Date.now(), siteId: this.siteId }
        this.logs.log(obj)
      })
    )
    this.logsSubs.push(
      this.network.onPeerLeave.subscribe((peer: number) => {
        const obj = { type: 'peerDisconnection', timestamp: Date.now(), siteId: this.siteId }
        this.logs.log(obj)
      })
    )

    this.logsSubs.push(
      this.muteCore.collaboratorsService.onJoin.subscribe((c: ICollaborator) => {
        const obj = { type: 'collaboratorJoin', timestamp: Date.now(), siteId: this.siteId }
        this.logs.log(obj)
      })
    )
    this.logsSubs.push(
      this.muteCore.collaboratorsService.onLeave.subscribe((c: number) => {
        const obj = { type: 'collaboratorLeave', timestamp: Date.now(), siteId: this.siteId }
        this.logs.log(obj)
      })
    )

    this.logsSubs.push(
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

    this.logsSubs.push(
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

  destroyLogs(): void {
    this.logsSubs.forEach((s) => s.unsubscribe())
  }

  private withEncryption() {
    this.muteCore.collaboratorsService.messageSource = this.network.onMessage
    this.muteCore.syncMessageService.messageSource = this.network.onMessage.pipe(
      filter(({ service }) => service === 423),
      flatMap((msg) => this.symCrypto.decrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
    )

    this.network.messageToBroadcastSource = merge(
      this.muteCore.collaboratorsService.onMsgToBroadcast,
      this.muteCore.syncMessageService.onMsgToBroadcast.pipe(
        flatMap((msg) => this.symCrypto.encrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
      )
    )

    this.network.messageToSendRandomlySource = merge(
      this.muteCore.collaboratorsService.onMsgToSendRandomly,
      this.muteCore.syncMessageService.onMsgToSendRandomly.pipe(
        flatMap((msg) => this.symCrypto.encrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
      )
    )

    this.network.messageToSendToSource = merge(
      this.muteCore.collaboratorsService.onMsgToSendTo,
      this.muteCore.syncMessageService.onMsgToSendTo.pipe(
        flatMap((msg) => this.symCrypto.encrypt(msg.content).then((content) => Object.assign({}, msg, { content })))
      )
    )
  }

  private withoutEncryption() {
    this.muteCore.messageSource = this.network.onMessage

    this.network.messageToBroadcastSource = this.muteCore.onMsgToBroadcast

    this.network.messageToSendRandomlySource = this.muteCore.onMsgToSendRandomly

    this.network.messageToSendToSource = this.muteCore.onMsgToSendTo
  }
}
