import { CryptoService } from '@app/core/crypto'
import { environment } from '@environments/environment'
import { BehaviorSubject, Subject } from 'rxjs'
import { INetworkSolution } from './network.solution.interface'
import { StreamId } from '@coast-team/mute-core'
import { ActivatedRoute } from '@angular/router'
import { NetworkSolutionServiceFunctions } from './network.solution.service.functions'
import { customAlphabet } from 'nanoid'

import { Libp2p, createLibp2p, Libp2pInit } from 'libp2p'
import { RecursivePartial } from '@libp2p/interfaces'
import { PeerDiscovery } from '@libp2p/interface-peer-discovery'
import { Transport } from '@libp2p/interface-transport'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { Mplex } from '@libp2p/mplex'
import { Multiaddr } from '@multiformats/multiaddr'
import { Noise } from '@chainsafe/libp2p-noise'
import { pipe } from 'it-pipe'
import { fromString, toString } from 'uint8arrays'
import { NetworkServiceAbstracted, PeersGroupConnectionStatus, SignalingServerConnectionStatus } from '..'

const PROTOCOL = '/chat/1.0.0'
export class Libp2pService extends NetworkSolutionServiceFunctions implements INetworkSolution {
  public myNetworkId: Subject<number>
  public peers: number[]
  public neighbors: number[]
  public cryptoService: CryptoService

  public peersGroupConnectionStatusSubject: BehaviorSubject<PeersGroupConnectionStatus>
  public memberJoinSubject: Subject<number>
  public memberLeaveSubject: Subject<number>
  public peerIdAsNumbers: Map<string, number>
  public peerIdAsNumbersReverse: Map<number, string>
  public currentDocumentKey: string
  public peersOnTheSameDocument: string[]
  public peersOnAnotherDocument: string[]

  public signalingServerConnectionStatus: SignalingServerConnectionStatus
  public intervalCheckingSignalingServer: NodeJS.Timeout
  public signalingAddressTest: string

  public libp2pInstance: Libp2p

  public readonly USE_GROUP = true
  public readonly USE_SERVER = true

  constructor(
    private messageReceived: Subject<{ streamId: StreamId; content: Uint8Array; senderNetworkId: number }>,
    peersGroupConnectionStatusSubjectAbstracted: BehaviorSubject<PeersGroupConnectionStatus>,
    private signalingServerConnectionStatusSubject: BehaviorSubject<SignalingServerConnectionStatus>,
    memberJoinSubjectAbstracted: Subject<number>,
    memberLeaveSubjectAbstracted: Subject<number>,
    private route: ActivatedRoute
  ) {
    super()
    this.myNetworkId = new Subject()
    this.peers = []
    this.peersGroupConnectionStatusSubject = peersGroupConnectionStatusSubjectAbstracted
    this.memberJoinSubject = memberJoinSubjectAbstracted
    this.memberLeaveSubject = memberLeaveSubjectAbstracted
    this.peerIdAsNumbers = new Map()
    this.peerIdAsNumbersReverse = new Map()
    this.peersOnTheSameDocument = []
    this.peersOnAnotherDocument = []
    this.signalingServerConnectionStatus = SignalingServerConnectionStatus.CLOSED //State is valued at offline before we start libp2p
    this.signalingAddressTest = environment.p2p.signalingServerTestAddr
    this.messageReceived = messageReceived
    this.initLibp2()
    window.addEventListener('beforeunload', () => {
      this.leaveNetwork()
    })
  }

  setAndInitCryptoService(cryptoService: CryptoService) {
    this.cryptoService = cryptoService
    this.cryptoService.setNetworkSolutionService(this)
    this.configureNetworkBehavior()
  }

  /**
   * Configure network behavior for the cryptographyProcess
   */
  configureNetworkBehavior(): void {
    this.cryptoService.handleCryptographyProcess(this.route)
  }

  /**
   * Initialize Libp2p
   */
  async initLibp2(): Promise<void> {
    const webRtcStar = new WebRTCStar()
    const transportKey = WebRTCStar.prototype[Symbol.toStringTag]
    const libp2p = await createLibp2p({
      addresses: {
        listen: [environment.p2p.signalingServer],
      },
      transports: [webRtcStar] as RecursivePartial<Transport>[] as any,
      connectionEncryption: [new Noise()],
      streamMuxers: [new Mplex()],
      peerDiscovery: [webRtcStar.discovery] as RecursivePartial<PeerDiscovery>[] as any,
      config: {
        transport: {
          [transportKey]: {
            listenerOptions: {
              config: environment.p2p.rtcConfiguration.iceServers,
            },
          },
        },
      },
    } as RecursivePartial<Libp2pInit>)
    this.configureAsyncNetworkBehavior(libp2p)
    this.checkConnectionToSignalingServer()
    await libp2p.start()
    this.libp2pInstance = libp2p
    const myPeerId = libp2p.peerId.toString()
    const myPeerIdAsNumber = this.generatePeerIdAsNumber()
    this.myNetworkId.next(myPeerIdAsNumber)
    this.addToPeerIdAsNumberMap(myPeerIdAsNumber, myPeerId)
  }

  /**
   * asynchronously handles the network behavior for sets of events
   * @param libp2p
   */
  async configureAsyncNetworkBehavior(libp2p: Libp2p): Promise<void> {
    // Receiving messages
    libp2p.handle(PROTOCOL, ({ connection, stream }) => {
      const me = this
      pipe(stream, async (source: AsyncGenerator<any, any, any>) => {
        for await (const msg of source) {
          const remotePeerId = connection.remotePeer.toString()
          if (me.isAPeerDocumentKeyMessage(msg)) {
            me.handlePeerIdsDocumentKey(remotePeerId, msg)
          } else if (me.isAPeerIdAsNumberMessage(msg)) {
            me.handlePeerIdAsNumber(remotePeerId, msg)
          } else {
            me.handleIncomingMessage(msg, me.messageReceived, me.peerIdAsNumbers.get(remotePeerId), me.cryptoService)
          }
        }
        stream.close() // We close the stream once we retreived the data to prevent mplex overloading and crashing
      })
    })

    // Handling peers joining or leaving
    libp2p.addEventListener('peer:discovery', (evt) => {
      const peer = evt.detail
      const remotePeerId = peer.id
      const remotePeerIdString = remotePeerId.toString()
      const isPeerOnAnotherDocument = this.peersOnAnotherDocument.includes(remotePeerIdString)
      if (!isPeerOnAnotherDocument) {
        this.broadcastMyDocumentKey(remotePeerIdString)
        this.broadcastMyPeerIdAsNumber(remotePeerIdString)
      }
      if (this.peersOnTheSameDocument.includes(remotePeerIdString)) {
        if (this.libp2pInstance.connectionManager.getConnections(remotePeerId).length < 1) {
          // If we are not yet connected to the peer
          this.libp2pInstance.connectionManager.openConnection(remotePeerId) // Runs the peer:connect event lower
        } else {
          this.manageConnectionToPeer(remotePeerIdString) // Adds the peer to the Peers and updates the ui
        }
      }
      this.purgePeersNotConnectedToUs()
    })
    libp2p.connectionManager.addEventListener('peer:connect', (evt) => {
      const peer = evt.detail
      const remotePeerId = peer.remotePeer
      const remotePeerIdString = remotePeerId.toString()
      const isPeerOnAnotherDocument = this.peersOnAnotherDocument.includes(remotePeerIdString)
      if (!isPeerOnAnotherDocument) {
        this.broadcastMyDocumentKey(remotePeerIdString)
        this.broadcastMyPeerIdAsNumber(remotePeerIdString)
      }
      if (this.peersOnTheSameDocument.includes(remotePeerIdString)) {
        this.manageConnectionToPeer(remotePeerIdString)
      }
    })
    libp2p.connectionManager.addEventListener('peer:disconnect', (evt) => {
      const peer = evt.detail
      const remotePeerId = peer.remotePeer
      const remotePeerIdString = remotePeerId.toString()
      this.libp2pInstance.hangUp(remotePeerId)
      this.libp2pInstance.connectionManager.closeConnections(remotePeerId)
      this.memberLeaveSubject.next(this.peerIdAsNumbers.get(remotePeerIdString))
      this.removePeerFromLists(remotePeerIdString)
    })
  }

  /**
   * Close connections to peers that are on another document
   */
  purgePeersNotConnectedToUs() {
    const listOfConnections = this.libp2pInstance.connectionManager.getConnections()
    for (const connection of listOfConnections) {
      const isPeerOnTheSameDocument = this.peersOnTheSameDocument.includes(connection.remotePeer.toString())
      const isPeerOnAnotherDocument = this.peersOnAnotherDocument.includes(connection.remotePeer.toString())
      if (!isPeerOnTheSameDocument && isPeerOnAnotherDocument) {
        const addrPeerHangUp = new Multiaddr(`${environment.p2p.signalingServer}p2p/${connection.remotePeer.toString()}`)
        this.libp2pInstance.hangUp(addrPeerHangUp)
      }
    }
  }

  /**
   * Handle connection to a libp2p peer
   * @param remotePeerId The peer which we connect to
   */
  manageConnectionToPeer(remotePeerId: string): void {
    if (this.peers.indexOf(this.peerIdAsNumbers.get(remotePeerId)) === -1) {
      this.peers.push(this.peerIdAsNumbers.get(remotePeerId))
      this.memberJoinSubject.next(this.peerIdAsNumbers.get(remotePeerId))
    }
  }

  /**
   * Resets every list that stores data about libp2p peers
   */
  clearPeersList(): void {
    this.peers = []
    this.peerIdAsNumbers.clear()
    this.peerIdAsNumbersReverse.clear()
    this.peersOnTheSameDocument = []
    this.peersOnAnotherDocument = []
  }

  /**
   * Remove a given peerId from lists that have them
   * @param remotePeerId The peerId to remove from our lists
   */
  removePeerFromLists(remotePeerId: string): void {
    let indexOfPeer = this.peers.indexOf(this.peerIdAsNumbers.get(remotePeerId))
    if (indexOfPeer !== -1) {
      this.peers.splice(indexOfPeer, 1)
    }
    indexOfPeer = this.peersOnTheSameDocument.indexOf(remotePeerId)
    if (indexOfPeer !== -1) {
      this.peersOnTheSameDocument.splice(indexOfPeer, 1)
    }
    indexOfPeer = this.peersOnAnotherDocument.indexOf(remotePeerId)
    if (indexOfPeer !== -1) {
      this.peersOnAnotherDocument.splice(indexOfPeer, 1)
    }
    this.removePeerIdAsNumberFromMap(remotePeerId)
  }

  /**
   * Calls the `network.solution.services.functions` send method which then calls the current service specific send function according to the value of the id parameter
   * @param streamId the streamid containing the stream type and subtype (see)
   * @param content the content to send
   * @param peers all the peers that are connected to us
   * @param id id of a peer (optional)
   */
  send(streamId: StreamId, content: Uint8Array, peers: number[], id?: number): void {
    super.send(streamId, content, peers, id)
  }

  /**
   * Send to all peers that are connected to us
   * @param message the message to send
   */
  sendToAll(message: Uint8Array): void {
    for (const key of this.peers) {
      const peerId = this.peerIdAsNumbersReverse.get(key)
      if (peerId) {
        const peerAddr = new Multiaddr(`${environment.p2p.signalingServer}p2p/${peerId}`)
        this.sendMessage(message, peerAddr)
      }
    }
  }

  /**
   * Send to a random peer connected to us
   * @param message the message to send
   */
  sendRandom(message: Uint8Array): void {
    const peerAddr = new Multiaddr(`${environment.p2p.signalingServer}p2p/${this.randomPeer(this.peers)}`)
    this.sendMessage(message, peerAddr)
  }

  /**
   * Send to a given peer
   * @param recipientNetworkId  the id of the peer which we are sending the message to
   * @param message the message to send
   */
  sendTo(recipientNetworkId: number, message: Uint8Array): void {
    const peerId = this.peerIdAsNumbersReverse.get(recipientNetworkId)
    const peerAddr = new Multiaddr(`${environment.p2p.signalingServer}p2p/${peerId}`)
    this.sendMessage(message, peerAddr)
  }

  /**
   * Creates the stream with the peer and sends the message in the stream
   * @param message the message to send
   * @param peerMultiAddr the multiaddr of the peer we are sending to
   */
  async sendMessage(message: Uint8Array, peerMultiAddr: Multiaddr): Promise<void> {
    try {
      const { stream } = await this.libp2pInstance.dialProtocol(peerMultiAddr, [PROTOCOL])
      await pipe([message], await stream)
      stream.close() // We close the stream once we have sent the data to prevent mplex overloading and crashing
    } catch (err) {
      log.error('There was an error while sending the message : ', err)
    }
  }

  /**
   * Joining the network and initializing libp2p
   * @param key the document Key
   */
  joinNetwork(key: string): void {
    this.currentDocumentKey = key
    if (this.libp2pInstance) {
      try {
        if (!this.libp2pInstance.isStarted()) {
          this.libp2pInstance.start()
        }
        this.peersGroupConnectionStatusSubject.next(PeersGroupConnectionStatus.JOINED)
      } catch (e: any) {
        console.log('An error happened while joining the network : ', e)
      }
    }
  }

  /**
   * Leaving the document and stopping libp2p
   */
  leaveNetwork(): void {
    for (const peer of this.peers) {
      const remotePeerIdString = this.peerIdAsNumbersReverse.get(peer)
      const addrPeerHangUp = new Multiaddr(`${environment.p2p.signalingServer}p2p/${remotePeerIdString}`)
      this.libp2pInstance.hangUp(addrPeerHangUp)
      this.memberLeaveSubject.next(this.peerIdAsNumbers.get(remotePeerIdString))
    }
    this.clearPeersList()
    this.libp2pInstance.stop()
    this.peersGroupConnectionStatusSubject.next(PeersGroupConnectionStatus.OFFLINE)
  }

  /**
   * Sets up an interval to check if the libp2p signaling server is up
   */
  checkConnectionToSignalingServer(): void {
    this.signalingServerConnectionStatus = SignalingServerConnectionStatus.CLOSED
    this.intervalCheckingSignalingServer = setInterval(this.testLibp2pSignalingServerConnectivity.bind(this), 2500)
  }

  /**
   * Tests connectivity to signaling by doing an http request
   * to the signaling server http page
   */
  async testLibp2pSignalingServerConnectivity(): Promise<void> {
    let isSignalingServerAccessible = true
    await window
      .fetch(this.signalingAddressTest, { method: 'GET' })
      .then((res) => {
        if (res.ok) {
          isSignalingServerAccessible = true
        }
      })
      .catch(() => {
        isSignalingServerAccessible = false
      })

    if (this.signalingServerConnectionStatus === SignalingServerConnectionStatus.CLOSED && isSignalingServerAccessible) {
      this.peersGroupConnectionStatusSubject.next(PeersGroupConnectionStatus.JOINED)
      this.signalingServerConnectionStatusSubject.next(SignalingServerConnectionStatus.OPEN)
    }

    if (this.signalingServerConnectionStatus === SignalingServerConnectionStatus.OPEN && !isSignalingServerAccessible) {
      this.peersGroupConnectionStatusSubject.next(PeersGroupConnectionStatus.OFFLINE)
      this.signalingServerConnectionStatusSubject.next(SignalingServerConnectionStatus.CLOSED)
    }
  }

  // Handling the peer routing
  /**
      As of the time of the code being written, libp2p didn't provide a system that could 
      limit peer connections to peers that are in the same room
      This means any peers connected to the signaling are connected to eachother
      This breaks the app because if a peer is on the document a and another on the document b,
      both document will synchronize as if peers are on the same document
      To bypass this, we broadcast our document key to whoever we are connecting to
      If them peer connecting to us shares the same document key, we add them to our list of peersOnTheSameDocument
   */
  /**
   * Send my current document key to the peer i'm trying to connect to
   * @param remotePeerId the peer i'm sending the document Key to
   */
  broadcastMyDocumentKey(remotePeerId: string): void {
    const documentKey = `myDocKey:${this.currentDocumentKey}`
    this.sendMessage(fromString(documentKey), new Multiaddr(`${environment.p2p.signalingServer}p2p/${remotePeerId}`))
  }

  /**
   * Check if the document key given by another peer is the same as mine
   * @param remotePeerId the peerID that broadcasted their document key
   * @param messageDocumentKey the message they sent containing the document key
   */
  handlePeerIdsDocumentKey(remotePeerId: string, messageDocumentKey: Uint8Array): void {
    const messageDocumentKeyAsString = toString(messageDocumentKey)
    const sizeMessageDocumentKeyAsString = messageDocumentKeyAsString.length
    if (messageDocumentKeyAsString.slice(9, sizeMessageDocumentKeyAsString) === this.currentDocumentKey) {
      if (this.peersOnTheSameDocument.indexOf(remotePeerId) === -1) {
        this.peersOnTheSameDocument.push(remotePeerId)
      }
    } else {
      if (this.peersOnAnotherDocument.indexOf(remotePeerId) === -1) {
        this.peersOnAnotherDocument.push(remotePeerId)
      }
    }
  }

  /**
   * Verify if a message received is a message broadcasting the documentKey
   * @param message the message broadcasted by another peer
   * @returns
   */
  isAPeerDocumentKeyMessage(message: Uint8Array): boolean {
    return toString(message).slice(0, 9) === 'myDocKey:'
  }

  // Handling the peerID string/number situation
  /*
     PeerIds are string that are used across libp2p. The core code of mute and mute-core expects number as peer ids. 
     We have to generate a number high enough so that there is almost no chance of a collision happening.
     We broadcast the document to peers we are trying to connect to and when connection is successful,
     the remote peer will link the peerId as number that we sent them to the peerId that libp2p uses 
    */
  /**
   * Send my peerId as a number to the peer i'm trying to connect to
   * @param remotePeerId the peer i'm sending the peerId as a number to
   */
  broadcastMyPeerIdAsNumber(remotePeerId: string): void {
    const myPeerIdAsNumber = this.peerIdAsNumbers.get(this.libp2pInstance.peerId.toString())
    const peerIdAsNumberMessage = `myPeerIdAsANumber:${myPeerIdAsNumber}`
    this.sendMessage(fromString(peerIdAsNumberMessage), new Multiaddr(`${environment.p2p.signalingServer}p2p/${remotePeerId}`))
  }

  /**
   * Check the peerIDAsNumber received
   * @param remotePeerId the peerID that broadcasted their peerID as a number
   * @param messagePeerIdAsNumber the message they sent containing their peerID as a number
   */
  handlePeerIdAsNumber(remotePeerId: string, messagePeerIdAsNumber: Uint8Array): void {
    const messagePeerIdAsNumberAsString = toString(messagePeerIdAsNumber)
    const sizemessagePeerIdAsNumberAsString = messagePeerIdAsNumberAsString.length
    const peerIdAsNumber = messagePeerIdAsNumberAsString.slice(18, sizemessagePeerIdAsNumberAsString)
    if (!this.peerIdAsNumbers.has(remotePeerId) && this.peersOnTheSameDocument.includes(remotePeerId)) {
      NetworkServiceAbstracted.tempNetworkId = Number(peerIdAsNumber)
      this.addToPeerIdAsNumberMap(Number(peerIdAsNumber), remotePeerId)
    }
  }

  /**
   * Verify if a message received is a message broadcasting the peerId as a number
   * @param message the message received
   * @returns true if the message contains the peerId as a number
   */
  isAPeerIdAsNumberMessage(message: Uint8Array): boolean {
    return toString(message).length > 18 && toString(message).slice(0, 18) === 'myPeerIdAsANumber:'
  }

  /**
   * Generates a high enough number that will serve as a peerId as a number
   * @returns a number used as a peerId as a number
   */
  generatePeerIdAsNumber(): number {
    const alphabet = '0123456789'
    const nanoid = customAlphabet(alphabet, 9)
    const peerIdAsNumberGenerated = nanoid()
    return Number(peerIdAsNumberGenerated)
  }

  /**
   * Pushes the peerId as a number to a map linking it to the original peerId as a string
   * @param peerIdAsNumber the peerID as a number to add
   */
  addToPeerIdAsNumberMap(peerIdAsNumber: number, peerId: string) {
    this.peerIdAsNumbers.set(peerId, peerIdAsNumber)
    this.peerIdAsNumbersReverse.set(peerIdAsNumber, peerId)
  }

  /**
   * Removes the number generated from the peerID from the corresponding map
   * @param peerId the peerID to remove
   */
  removePeerIdAsNumberFromMap(peerId: string): void {
    const peerIdAsNumberGenerated = this.peerIdAsNumbers.get(peerId)
    this.peerIdAsNumbers.delete(peerId)
    this.peerIdAsNumbersReverse.delete(peerIdAsNumberGenerated)
  }
}
