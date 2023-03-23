import { Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs/internal/Subject'
import { Server } from 'http'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'

import { StreamId, Streams as MuteCoreStreams } from '@coast-team/mute-core'
import { KeyState } from '@coast-team/mute-crypto'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { CryptoService } from '@app/core/crypto'
import { environment } from '@environments/environment'

import { RichCollaborator } from '@app/doc/rich-collaborators/RichCollaborator'
import { IdMap } from './idMap'
import { Message } from './message_proto'
import { PulsarService } from './pulsar.service'

import { INetworkSolution } from './solutions/network.solution.interface'
import { networkSolution } from './solutions/networkSolution'
import { NetfluxService } from './solutions/netflux.service'
import { Libp2pService } from './solutions/libp2p.service'
import { IMessageIn, IMessageOut } from '@coast-team/mute-core/dist/types/src/misc'

export enum PeersGroupConnectionStatus {
  JOINING,
  JOINED,
  OFFLINE,
  NO_GROUP,
}

export enum SignalingServerConnectionStatus {
  CONNECTING,
  OPEN,
  CHECKING,
  CLOSED,
  CHECKED,
}

@Injectable()
export class NetworkServiceAbstracted implements OnDestroy {
  public static tempNetworkId: number
  public server: Server
  public groupOfCollaborators: [RichCollaborator]
  public documentKey: string
  public solution: INetworkSolution
  // idMap for the peers
  public idMap: IdMap
  // My network identifier
  public myNetworkId: number
  private botUrls: string[]
  // Connection state to the group of peers subject
  private peersGroupConnectionStatusSubject: BehaviorSubject<PeersGroupConnectionStatus>
  // Connection state to the group of peers subject
  private signalingServerConnectionStatusSubject: BehaviorSubject<SignalingServerConnectionStatus>
  private subs: Subscription[]
  // Subjects related to the current peer
  private leaveSubject: Subject<number>
  // Network message subject
  private messageSubject: Subject<IMessageIn>
  // Peer Join/Leave subjects
  private memberJoinSubject: Subject<number>
  private memberLeaveSubject: Subject<number>

  // ------------ Constructor ----------
  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private cryptoService: CryptoService,
    public pulsarService: PulsarService
  ) {
    this.groupOfCollaborators = [null]
    this.idMap = new IdMap()
    this.leaveSubject = new Subject()
    this.messageSubject = new Subject()
    this.memberJoinSubject = new Subject()
    this.memberLeaveSubject = new Subject()

    this.botUrls = []
    this.subs = []

    // Connections status for the UI
    this.peersGroupConnectionStatusSubject = new BehaviorSubject(PeersGroupConnectionStatus.OFFLINE)
    this.signalingServerConnectionStatusSubject = new BehaviorSubject(SignalingServerConnectionStatus.CLOSED)
    this.initNetworkSolution(this.zone, this.route)
    this.setAndInitCryptoServiceNetworkSolution(cryptoService)
  }

  // -------- Subjects getters related to server connectivy, members leaving, joining ------
  get onPeersGroupConnectionStatusChange(): Observable<PeersGroupConnectionStatus> {
    return this.peersGroupConnectionStatusSubject.asObservable()
  }

  get onSignalingServerConnectionStatusChange(): Observable<SignalingServerConnectionStatus> {
    return this.signalingServerConnectionStatusSubject.asObservable()
  }

  get onMemberJoin(): Observable<number> {
    return this.memberJoinSubject.asObservable()
  }

  get onMemberLeave(): Observable<number> {
    return this.memberLeaveSubject.asObservable()
  }

  get onLeave(): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  // ---------------- ENCRYPTION -------------------------------
  get cryptoState(): KeyState {
    return this.cryptoService.crypto.state
  }

  get onCryptoStateChange(): Observable<KeyState> {
    return this.cryptoService.onStateChange
  }

  get messageIn(): Observable<IMessageIn> {
    return this.messageSubject.asObservable()
  }

  /**
   * Initialize the network solution to use
   * @param zone the angular zone
   * @param route the route
   */
  initNetworkSolution(zone: NgZone, route: ActivatedRoute) {
    switch (environment.network) {
      case networkSolution.NETFLUX:
        this.solution = new NetfluxService(
          this.messageSubject,
          this.peersGroupConnectionStatusSubject,
          this.signalingServerConnectionStatusSubject,
          this.memberJoinSubject,
          this.memberLeaveSubject,
          zone,
          route
        )
        break
      case networkSolution.LIBP2P:
        this.solution = new Libp2pService(
          this.messageSubject,
          this.peersGroupConnectionStatusSubject,
          this.signalingServerConnectionStatusSubject,
          this.memberJoinSubject,
          this.memberLeaveSubject,
          route
        )
        break
      default:
        log.error('Current network is not recognized')
        break
    }
    this.retrieveNetworkId()
  }

  /**
   * Set the crypto service to be used by the network solution
   * @param cryptoService the crypto service to use
   */
  setAndInitCryptoServiceNetworkSolution(cryptoService: CryptoService) {
    this.solution.setAndInitCryptoService(cryptoService)
  }

  /**
   * Connect to the network
   * @param key the document key
   */
  public joinNetwork(key: string): void {
    this.solution.joinNetwork(key)
    this.documentKey = key
  }

  /**
   * Leave the network
   */
  public leaveNetwork(): void {
    this.solution.leaveNetwork()
  }

  /**
   * Add a RichCollaborator to the group of collaborators
   * @param rc the collaborator to remove
   */
  addCollaboratorToGroup(rc: RichCollaborator): void {
    if (this.groupOfCollaborators[0] === null) {
      this.groupOfCollaborators[0] = rc
    }
  }

  /**
   * Remove a collaborator from the group
   * @param rcIndex
   */
  removeCollaboratorFromGroup(rcIndex: number): void {
    this.groupOfCollaborators.splice(rcIndex, 1)
  }

  /**
   * Get the network Id set in the network solution
   */
  retrieveNetworkId(): void {
    this.solution.myNetworkId.subscribe((myNetworkId) => {
      this.myNetworkId = myNetworkId
    })
  }

  /**
   * Whenever mutecore needs to send something, we send it over the network
   * @param source the mutecore messageOut observable
   */
  setMessageOut(source: Observable<IMessageOut>): void {
    this.subs[this.subs.length] = source.subscribe(({ streamId, content, recipientNetworkId }) => {
      if (streamId.type === MuteCoreStreams.DOCUMENT_CONTENT && environment.cryptography.type !== EncryptionType.NONE) {
        if (this.cryptoService.crypto.state === KeyState.READY) {
          this.cryptoService.crypto.encrypt(content).then((encryptedContent) => {
            this.send(streamId, encryptedContent, recipientNetworkId)
          })
        }
      } else {
        this.send(streamId, content, recipientNetworkId)
      }
    })
  }

  /**
   * Send a message
   * @param streamId the type of message to send
   * @param content the content of the message
   * @param id (optional) peer id we're sending the message to
   */
  send(streamId: StreamId, content: Uint8Array, id?: number): void {
    const msg = Message.create({ type: streamId.type, subtype: streamId.subtype, content })
    if (id === undefined) {
      this.solution.sendToAll(Message.encode(msg).finish())
    } else {
      if (id === 0) {
        this.solution.sendRandom(Message.encode(msg).finish())
      } else {
        this.solution.sendTo(id, Message.encode(msg).finish())
      }
    }
  }

  // --------- Angular related function -------
  ngOnDestroy(): void {
    this.leaveSubject.complete()
    this.messageSubject.complete()
    this.memberJoinSubject.complete()
    this.memberLeaveSubject.complete()
    this.peersGroupConnectionStatusSubject.complete()
    this.signalingServerConnectionStatusSubject.complete()
    this.solution.myNetworkId.complete()
    this.solution.leaveNetwork()
  }

  inviteBot(url: string): void {
    log.warn('Bot functionality is not available')
    /*
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.zone.runOutsideAngular(() => this.wg.invite(fullUrl)) // old code requires 'wg' from 'netflux'
    }
    */
  }
}
