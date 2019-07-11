import { HostListener, Injectable, OnDestroy } from '@angular/core'
import { StreamId, Streams } from '@coast-team/mute-core'
import { Observable, Subject } from 'rxjs'
import { Doc } from 'src/app/core/Doc'
import { Stream } from 'stream'
@Injectable()
export class PulsarService implements OnDestroy {
  private messageArray0 = []
  private messageArray2 = []

  public _sockets: WebSocket[] = []
  public pulsarMessageSubject: Subject<{ streamId: Streams; content: Uint8Array }>
  constructor() {
    this.pulsarMessageSubject = new Subject()
  }

  ngOnDestroy() {}

  get pulsarMessage$(): Observable<{ streamId: Streams; content: Uint8Array }> {
    return this.pulsarMessageSubject.asObservable()
  }

  set sockets(topic: string) {
    const docType = 400
    const encoder = new TextEncoder()

    this.closeSocketConnexion('setsocket') // in case websockets are not closed yet

    this.getMessageFromLocalStorage(topic)

    for (let i = 1; i < 3; i++) {
      const sockPost = new WebSocket('ws://localhost:8080/ws/v2/producer/persistent/public/default/' + (docType + i) + '-' + topic)
      const sockEcoute = this.createWsEcoute(topic, i, docType)

      this.socketPostConfig(sockPost, i, topic, docType)
      this.socketEcouteConfig(sockEcoute, i, topic, docType)

      this._sockets.push(sockPost)
      this._sockets.push(sockEcoute)
    }
    console.log(this._sockets)
  }
  private arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  private base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  sendMessageToPulsar(streamId: Streams, keyTopic: string, content: Uint8Array) {
    console.log("les sockets avant l'envoi", this.socketsReadystate())
    const content64 = this.arrayBufferToBase64(content)
    const message = {
      payload: btoa(content64), // required
      properties: {
        // optionnal
        stream: streamId,
        topic: keyTopic,
      },
    }

    switch (streamId) {
      case Streams.METADATA:
        if (this._sockets[0].readyState === 1) {
          this._sockets[0].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArray0.push(JSON.stringify(message))
          window.localStorage.setItem('msgPulsarMetadata' + keyTopic, JSON.stringify(this.messageArray0))
          console.log('put')
        }
        break
      case Streams.DOCUMENT_CONTENT:
        if (this._sockets[2].readyState === 1) {
          this._sockets[2].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArray2.push(JSON.stringify(message))
          window.localStorage.setItem('msgPulsarDocContent' + keyTopic, JSON.stringify(this.messageArray2))
          console.log('put')
        }
        break
      default:
        break
    }
  }

  closeSocketConnexion(location: string) {
    if (this._sockets.length !== 0) {
      while (this._sockets.length !== 0) {
        this._sockets.pop().close(1000, location)
      }
      console.log('Les websockets ont été fermées aves succès de ' + location, this._sockets)
    } else {
      console.log('Pas de socket à fermer.\n')
    }
  }

  socketsReadystate(): number[] {
    const sockStateArray: number[] = []
    for (const sock of this._sockets) {
      sockStateArray.push(sock.readyState)
    }
    return sockStateArray
  }

  getMessageFromLocalStorage(topic: string) {
    const localStorageMsg0 = window.localStorage.getItem('msgPulsarMetadata' + topic)
    const localStorageMsg2 = window.localStorage.getItem('msgPulsarDocContent' + topic)

    this.messageArray0 = localStorageMsg0 === 'null' || localStorageMsg0 === null ? [] : JSON.parse(localStorageMsg0)
    this.messageArray2 = localStorageMsg2 === 'null' || localStorageMsg2 === null ? [] : JSON.parse(localStorageMsg2)
  }

  createWsEcoute(topic: string, i: number, docType: number): WebSocket {
    const msgIdFromStorage = window.localStorage.getItem('msgId-' + (docType + i) + topic)
    // if (true) {
    if (msgIdFromStorage === null) {
      return new WebSocket(
        'ws://localhost:8080/ws/v2/reader/persistent/public/default/' + (docType + i) + '-' + topic + '/?messageId=earliest'
      )
    } else {
      return new WebSocket(
        'ws://localhost:8080/ws/v2/reader/persistent/public/default/' + (docType + i) + '-' + topic + '/?messageId=' + msgIdFromStorage
      )
    }
  }

  socketPostConfig(sockPost: WebSocket, i: number, topic: string, docType) {
    sockPost.onerror = (err) => {
      console.log('Erreur socket producer Pulsar', err)
    }
    // reception de messages, le producteur ne recevra que des acks
    sockPost.onmessage = (messageSent: MessageEvent) => {
      console.log('ack received : ', messageSent.data)
    }

    if (i === 1) {
      sockPost.onopen = () => {
        for (const message of this.messageArray0) {
          this._sockets[0].send(message)
        }
        window.localStorage.setItem('msgPulsarMetadata' + topic, null)
      }
      sockPost.onclose = (event) => {
        console.log('socket: ' + sockPost.url + ' fermee\n', event)
        if (event.reason !== 'networkService') {
          const newWs = new WebSocket('ws://localhost:8080/ws/v2/producer/persistent/public/default/' + (docType + i) + '-' + topic)
          this.socketPostConfig(newWs, 1, topic, docType)
          this._sockets[0] = newWs
          console.log('On refait une socket')
        }
        console.log('les sockets 0\n', this._sockets)
      }
    }
    if (i === 2) {
      sockPost.onopen = () => {
        for (const message of this.messageArray2) {
          this._sockets[2].send(message)
        }
        window.localStorage.setItem('msgPulsarDocContent' + topic, null)
      }

      sockPost.onclose = (event) => {
        console.log('socket: ' + sockPost.url + ' fermee', event)
        if (event.reason !== 'networkService') {
          const newWs = new WebSocket('ws://localhost:8080/ws/v2/producer/persistent/public/default/' + (docType + i) + '-' + topic)
          this.socketPostConfig(newWs, 2, topic, docType)
          this._sockets[2] = newWs
          console.log('On refait une socket')
        }
        console.log('les sockets 2\n', this._sockets)
      }
    }
  }

  socketEcouteConfig(sockEcoute: WebSocket, i: number, topic: string, docType) {
    sockEcoute.onerror = (err) => {
      console.log('Erreur socket producer Pulsar', err)
    }

    sockEcoute.onmessage = (messageSent: MessageEvent) => {
      const receiveMsg = JSON.parse(messageSent.data)
      const streamId = Number(receiveMsg.properties.stream)
      console.log(receiveMsg)
      window.localStorage.setItem('msgId-' + (docType + i) + topic, receiveMsg.messageId)
      const content = new Uint8Array(this.base64ToArrayBuffer(atob(receiveMsg.payload)))
      this.pulsarMessageSubject.next({ streamId, content })
    }

    if (i === 1) {
      sockEcoute.onclose = (event) => {
        console.log('socket: ' + sockEcoute.url + ' fermee\n', event)
        if (event.reason !== 'networkService') {
          const newWs = this.createWsEcoute(topic, i, docType)
          this.socketPostConfig(newWs, 1, topic, docType)
          this._sockets[1] = newWs
          console.log('On refait une socket')
        }
        console.log('les sockets 1\n ', this._sockets)
      }
    }

    if (i === 2) {
      sockEcoute.onclose = (event) => {
        console.log('socket: ' + sockEcoute.url + ' fermee', event)
        if (event.reason !== 'networkService') {
          const newWs = this.createWsEcoute(topic, 2, docType)
          this.socketPostConfig(newWs, 1, topic, docType)
          this._sockets[3] = newWs
          console.log('On refait une socket')
        }
        console.log('les sockets 3\n', this._sockets)
      }
    }
  }
}
