import { NgZone } from '@angular/core'
import { CryptoService } from '@app/core/crypto'
import { environment } from '@environments/environment'
import { WebGroup, WebGroupState } from 'netflux'
import { BehaviorSubject, Subject } from 'rxjs'
import { INetworkSolution } from './network.solution.interface'
import { StreamId } from '@coast-team/mute-core'
import { ActivatedRoute } from '@angular/router'
import { NetworkSolutionServiceFunctions } from './network.solution.service.functions'
import {
  NetworkServiceAbstracted,
  PeersGroupConnectionStatus,
  SignalingServerConnectionStatus,
} from '@app/doc/network/network.service.abstracted'

export class NetfluxService extends NetworkSolutionServiceFunctions implements INetworkSolution {
  public myNetworkId: Subject<number>
  public peers: number[]
  public neighbors: number[]
  public peersGroupConnectionStatusSubject: BehaviorSubject<PeersGroupConnectionStatus>
  public memberJoinSubject: Subject<number>
  public memberLeaveSubject: Subject<number>
  public cryptoService: CryptoService

  public wg: WebGroup

  public readonly USE_GROUP = true
  public readonly USE_SERVER = true

  constructor(
    private messageReceived: Subject<{ streamId: StreamId; content: Uint8Array; senderNetworkId: number }>,
    peersGroupConnectionStatusSubjectAbstracted: BehaviorSubject<PeersGroupConnectionStatus>,
    private signalingServerConnectionStatusSubject: BehaviorSubject<SignalingServerConnectionStatus>,
    memberJoinSubjectAbstracted: Subject<number>,
    memberLeaveSubjectAbstracted: Subject<number>,
    private zone: NgZone,
    private route: ActivatedRoute
  ) {
    super()
    this.myNetworkId = new Subject()
    this.peers = []
    this.peersGroupConnectionStatusSubject = peersGroupConnectionStatusSubjectAbstracted
    this.memberJoinSubject = memberJoinSubjectAbstracted
    this.memberLeaveSubject = memberLeaveSubjectAbstracted
    this.zone.runOutsideAngular(() => {
      this.wg = new WebGroup({
        signalingServer: environment.p2p.signalingServer,
        rtcConfiguration: environment.p2p.rtcConfiguration,
      })
      window.wg = this.wg
      this.wg.onSignalingStateChange = (state) => {
        const status = state as unknown as SignalingServerConnectionStatus
        this.signalingServerConnectionStatusSubject.next(status)
      }
    })
    this.messageReceived = messageReceived
  }

  //getters, setters
  get members(): number[] {
    return this.wg.members
  }

  setAndInitCryptoService(cryptoService: CryptoService) {
    this.cryptoService = cryptoService
    this.cryptoService.setNetworkSolutionService(this)
    this.configureNetworkBehavior()
  }

  // Initializing connection to the webGroup
  joinNetwork(key: string): void {
    this.wg.join(key)
  }

  leaveNetwork(): void {
    this.wg.leave()
  }

  send(streamId: StreamId, content: Uint8Array, peers: number[], id?: number): void {
    super.send(streamId, content, peers, id)
  }

  sendToAll(message: Uint8Array): void {
    this.wg.send(message)
  }

  sendRandom(message: Uint8Array): void {
    const idPeer = this.randomPeer(this.peers)
    this.wg.sendTo(idPeer, message)
  }

  sendTo(recipientNetworkId: number, message: Uint8Array): void {
    this.wg.sendTo(recipientNetworkId, message)
  }

  /**
   * Configure the cryptoservice usage, how we handle peers joining, leaving, connection state change
   */
  configureNetworkBehavior(): void {
    this.cryptoService.handleCryptographyProcess(this.route)
    this.wg.onMemberJoin = (networkId) => {
      this.peers.push(networkId)
      NetworkServiceAbstracted.tempNetworkId = networkId
      this.memberJoinSubject.next(networkId)
    }
    this.wg.onMemberLeave = (networkId) => {
      const indexPeer = this.peers.findIndex((p) => p === networkId)
      this.peers.splice(indexPeer, 1)
      this.memberLeaveSubject.next(networkId)
    }
    this.wg.onMyId = (id) => {
      this.myNetworkId.next(id)
    }
    this.wg.onStateChange = (state: WebGroupState) => {
      const status = state as unknown as PeersGroupConnectionStatus
      this.peersGroupConnectionStatusSubject.next(status)
    }
    this.wg.onMessage = (networkId, bytes: Uint8Array) => {
      try {
        this.handleIncomingMessage(bytes, this.messageReceived, networkId, this.cryptoService)
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }
}
