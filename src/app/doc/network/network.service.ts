import { Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

import { StreamId, Streams, Streams as MuteCoreStreams, StreamsSubtype } from '@coast-team/mute-core'
import { KeyAgreementBD, KeyState, Streams as MuteCryptoStreams, Symmetric } from '@coast-team/mute-crypto'
import { SignalingState, WebGroup, WebGroupState } from 'netflux'
import { keyAgreementCrypto } from '@coast-team/mute-crypto-helper'

import { environment } from '@environments/environment'
import { CryptoService } from '@app/core/crypto'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { Doc } from '@app/core/Doc'

import { Message } from './message_proto'
import { PulsarService } from './pulsar.service'

import { IdMap } from './idMap'

@Injectable()
export class NetworkService implements OnDestroy {
  public wg: WebGroup

  private botUrls: string[]

  // Subjects related to the current peer
  private leaveSubject: Subject<number>

  // Network message subject
  private messageSubject: Subject<{ streamId: StreamId; content: Uint8Array; senderNetworkId: number }>

  // Peer Join/Leave subjects
  private memberJoinSubject: Subject<number>
  private memberLeaveSubject: Subject<number>

  // Connection state subject
  private stateSubject: BehaviorSubject<WebGroupState>
  private signalingSubject: BehaviorSubject<SignalingState>

  // idMap for the peers
  public idMap : IdMap
  public tempNetworkId : number

  // Other
  private subs: Subscription[]
  private _pulsarOn: boolean

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private cryptoService: CryptoService,
    public pulsarService: PulsarService
  ) {
    this.botUrls = []
    this.subs = []

    // Initialize subjects
    this.memberJoinSubject = new Subject()
    this.memberLeaveSubject = new Subject()
    this.signalingSubject = new BehaviorSubject(SignalingState.CLOSED)
    this.stateSubject = new BehaviorSubject(WebGroupState.LEFT)
    this.messageSubject = new Subject()
    this.leaveSubject = new Subject()

    //Initialize the id map 
    this.idMap = new IdMap()

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
      this.wg = new WebGroup({
        signalingServer: environment.p2p.signalingServer,
        rtcConfiguration: environment.p2p.rtcConfiguration,
      })
      window.wg = this.wg

      this.wg.onSignalingStateChange = (state) => this.signalingSubject.next(state)

      this.configureEncryption(environment.cryptography.type)
    })
  }

  get myId (): number {
    return this.wg.myId
  }

  get members (): number[] {
    return this.wg.members
  }

  get state (): WebGroupState {
    return this.wg.state
  }

  get cryptoState (): KeyState {
    return this.cryptoService.crypto.state
  }

  get messageOut (): Observable<{ streamId: StreamId; content: Uint8Array; senderNetworkId: number }> {
    return this.messageSubject.asObservable()
  }

  get onLeave (): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  get onMemberJoin (): Observable<number> {
    return this.memberJoinSubject.asObservable()
  }

  get onMemberLeave (): Observable<number> {
    return this.memberLeaveSubject.asObservable()
  }

  get onStateChange (): Observable<WebGroupState> {
    return this.stateSubject.asObservable()
  }

  get onSignalingStateChange (): Observable<SignalingState> {
    return this.signalingSubject.asObservable()
  }

  get onCryptoStateChange (): Observable<KeyState> {
    return this.cryptoService.onStateChange
  }

  get pulsarOn () {
    return this._pulsarOn
  }

  set pulsarOn (newPulsar: boolean) {
    this._pulsarOn = newPulsar
  }

  ngOnDestroy(): void {
    if (this.wg !== undefined) {
      this.messageSubject.complete()
      this.leaveSubject.complete()
      this.memberJoinSubject.complete()
      this.memberLeaveSubject.complete()
      this.pulsarService.closeSocketConnexion('networkService')
      this.pulsarService.closeSocketLogsConnexion('networkService')
      this.wg.leave()
    }
  }

  join (key: string) {
    this.wg.join(key)

    /*
    this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      // for the one who create the doc
      this._pulsarOn = doc.pulsar || this._pulsarOn
      if (this._pulsarOn) {
        this.pulsarConnect(this.wg.id)
        return
      }

      // for the others
      doc.onMetadataChanges
        .pipe(
          filter(({ isLocal, changedProperties }) => {
            return changedProperties.includes(Doc.PULSAR)
          })
        )
        .subscribe(() => {
          if (this._pulsarOn) {
            return // if the change concerns pulsar but is already connected to pulsar
          }
          this._pulsarOn = doc.pulsar
          if (this._pulsarOn) {
            this.pulsarConnect(this.wg.id)
          }
        })
    })*/
  }

  leave () {
    this.wg.leave()
  }

  setMessageIn (source: Observable<{ streamId: StreamId; content: Uint8Array; recipientNetworkId?: number }>) {
    this.subs[this.subs.length] = source.subscribe(({ streamId, content, recipientNetworkId }) => {
      if (streamId.type === MuteCoreStreams.DOCUMENT_CONTENT && environment.cryptography.type !== EncryptionType.NONE) {
        if (
          !recipientNetworkId &&
          this._pulsarOn &&
          streamId.subtype !== StreamsSubtype.DOCUMENT_QUERY &&
          streamId.subtype !== StreamsSubtype.DOCUMENT_REPLY
        ) {
          console.log('setMessageIn NOW PULSAR', streamId)
          this.pulsarService.sendMessageToPulsar(streamId, this.wg.key, content)
        }
        this.cryptoService.crypto
          .encrypt(content)
          .then((encryptedContent) => {
            this.send(streamId, encryptedContent, recipientNetworkId)
          })
          .catch((err) => {})
      } else {
        this.send(streamId, content, recipientNetworkId)
        if (
          !recipientNetworkId &&
          this._pulsarOn &&
          streamId.subtype !== StreamsSubtype.METADATA_FIXDATA &&
          streamId.type !== Streams.COLLABORATORS &&
          streamId.subtype !== StreamsSubtype.DOCUMENT_QUERY &&
          streamId.subtype !== StreamsSubtype.DOCUMENT_REPLY
        ) {
          console.log('setMessageIn NOW PULSAR', streamId)
          this.pulsarService.sendMessageToPulsar(streamId, this.wg.key, content)
        }
      }
    })

    // Replace when crypto is working for a user who is alone

    // if (messagePulsar.streamId === MuteCoreStreams.DOCUMENT_CONTENT && environment.cryptography.type !== EncryptionType.NONE) {
    //   this.cryptoService.crypto
    //     .decrypt(messagePulsar.content)
    //     .then((decryptedContent) => {
    //       console.log('DECRYPT PULSAR', decryptedContent)
    // this.messageSubject.next({ streamId: {type : messagePulsar.streamId, subtype : StreamsSubtype.METADATA_PULSAR}, content: decryptedContent, senderId: id })
    //     })
    //     .catch((err) => {
    //       console.log('decrypt err', err)
    //     })
    //   return
    // }
  }

  pulsarConnect (id: number) {
    this.pulsarService.sockets = this.wg.key
    this.pulsarService.pulsarMessage$.subscribe((messagePulsar) => {
      try {
        this.messageSubject.next({
          streamId: { type: messagePulsar.streamId, subtype: StreamsSubtype.METADATA_PULSAR },
          content: messagePulsar.content,
          senderNetworkId: id,
        })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    })
  }

  inviteBot (url: string): void {
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.zone.runOutsideAngular(() => this.wg.invite(fullUrl))
    }
  }

  send (streamId: StreamId, content: Uint8Array, id?: number): void {
    if (this.members.length > 1) {
      const msg = Message.create({ type: streamId.type, subtype: streamId.subtype, content })

      if (id === undefined) {
        this.wg.send(Message.encode(msg).finish())
      } else {
        id = id === 0 ? this.randomMember() : id
        this.wg.sendTo(id, Message.encode(msg).finish())
      }
    }
  }

  private randomMember(): number {
    const otherMembers = this.members.filter((i) => i !== this.wg.myId)
    return otherMembers[Math.ceil(Math.random() * otherMembers.length) - 1]
  }

  private configureEncryption (type: EncryptionType) {
    switch (type) {
      case EncryptionType.KEY_AGREEMENT_BD:
        this.configureKeyAgreementBDEncryption()
        break
      case EncryptionType.METADATA:
        this.configureMetaDataEncryption()
        break
      case EncryptionType.NONE:
        this.configureNoEncryption()
        break
      default:
        log.error('Unknown Encryption type: ', type)
    }
  }

  private configureKeyAgreementBDEncryption() {
    const bd = this.cryptoService.crypto as KeyAgreementBD
    if (environment.cryptography.coniksClient || environment.cryptography.keyserver) {
      bd.signingKey = this.cryptoService.signingKeyPair.privateKey
      this.cryptoService.onSignatureError = (id) => log.error('Signature verification error for ', id)
    }
    bd.onSend = (msg, streamId) => this.send({ type: streamId, subtype: StreamsSubtype.CRYPTO }, msg)
    // Handle network events
    this.wg.onMyId = (myId) => bd.setMyId(myId)
    this.wg.onMemberJoin = (networkId) => {
      bd.addMember(networkId)
      this.memberJoinSubject.next(networkId)
    }
    this.wg.onMemberLeave = (networkId) => {
      bd.removeMember(networkId)
      this.memberLeaveSubject.next(networkId)
    }
    this.wg.onStateChange = (state: WebGroupState) => {
      if (state === WebGroupState.JOINED) {
        bd.setReady()
      }
      this.stateSubject.next(state)
    }
    this.wg.onMessage = (networkId, bytes: Uint8Array) => {
      try {
        const { type, subtype, content } = Message.decode(bytes)
        if (type === MuteCryptoStreams.KEY_AGREEMENT_BD) {
          this.cryptoService.onBDMessage(networkId, content)
        } else {
          if (type === MuteCoreStreams.DOCUMENT_CONTENT) {
            this.cryptoService.crypto
              .decrypt(content)
              .then((decryptedContent) => {
                this.messageSubject.next({ streamId: { type, subtype }, content: decryptedContent, senderNetworkId: networkId })
              })
              .catch((err) => {})
            return
          }
          this.messageSubject.next({ streamId: { type, subtype }, content, senderNetworkId: networkId })
        }
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }

  private configureMetaDataEncryption() {
    this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      doc.onMetadataChanges
        .pipe(
          filter(({ isLocal, changedProperties }) => {
            return !isLocal && changedProperties.includes(Doc.CRYPTO_KEY)
          })
        )
        .subscribe(() => {
          ;(this.cryptoService.crypto as Symmetric).importKey(doc.cryptoKey)
        })
    })
    // Handle network events
    this.wg.onMemberJoin = (networkId) => {
      this.memberJoinSubject.next(networkId)
    } 
    this.wg.onMemberLeave = (networkId) => {
      this.memberLeaveSubject.next(networkId)
    }
    this.wg.onStateChange = (state: WebGroupState) => this.stateSubject.next(state)

    this.wg.onMessage = (networkId, bytes: Uint8Array) => {
      try {
        const { type, subtype, content } = Message.decode(bytes)
        if (type === MuteCoreStreams.DOCUMENT_CONTENT) {
          this.cryptoService.crypto
            .decrypt(content)
            .then((decryptedContent) => {
              this.messageSubject.next({ streamId: { type, subtype }, content: decryptedContent, senderNetworkId: networkId })
            })
            .catch((err) => {})
          return
        }
        this.messageSubject.next({ streamId: { type, subtype }, content, senderNetworkId: networkId })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }

  private configureNoEncryption() {
    // Handle network events
    this.wg.onMemberJoin = (networkId) => this.memberJoinSubject.next(networkId)
    this.wg.onMemberLeave = (networkId) => this.memberLeaveSubject.next(networkId)
    this.wg.onStateChange = (state: WebGroupState) => this.stateSubject.next(state)

    this.wg.onMessage = (networkId, bytes: Uint8Array) => {
      try {
        const { type, subtype, content } = Message.decode(bytes)
        this.messageSubject.next({ streamId: { type, subtype }, content, senderNetworkId: networkId })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }
}
