import { Injectable, OnDestroy } from '@angular/core'
import { StreamId, Streams } from '@coast-team/mute-core'
import { Observable, Subject } from 'rxjs'
import { Doc } from 'src/app/core/Doc'
import { Stream } from 'stream'
@Injectable()
export class PulsarService implements OnDestroy {
  private messageArray0 = []
  private messageArray2 = []
  private messageArray4 = []

  public _sockets: WebSocket[] = []
  public pulsarMessageSubject: Subject<{ streamId: Streams; content: Uint8Array }>
  constructor() {
    this.pulsarMessageSubject = new Subject()
  }
  ngOnDestroy() {
    // couper lien avec Pulsar ici
  }
  get pulsarMessage$(): Observable<{ streamId: Streams; content: Uint8Array }> {
    return this.pulsarMessageSubject.asObservable()
  }

  set sockets(topic: string) {
    const docType = 400
    const encoder = new TextEncoder()
    while (this._sockets.length !== 0) {
      this._sockets.pop().close()
    }
    for (let i = 0; i < 3; i++) {
      const sockPost = new WebSocket('ws://localhost:8080/ws/v2/producer/persistent/public/default/' + (docType + i) + '-' + topic)

      let sockEcoute
      const msgIdFromStorage = window.localStorage.getItem('messageId-' + topic)
      // if (true) {
      if (msgIdFromStorage === null) {
        sockEcoute = new WebSocket(
          'ws://localhost:8080/ws/v2/reader/persistent/public/default/' + (docType + i) + '-' + topic + '/?messageId=earliest'
        )
      } else {
        sockEcoute = new WebSocket(
          'ws://localhost:8080/ws/v2/reader/persistent/public/default/' + (docType + i) + '-' + topic + '/?messageId=' + msgIdFromStorage
        )
      }

      sockPost.onerror = (err) => {
        console.log('Erreur socket producer Pulsar', err)
      }

      // reception de messages, le producteur ne recevra que des acks
      sockPost.onmessage = (messageSent: MessageEvent) => {
        console.log('ack received : ', messageSent.data)
      }

      if (i === 0) {
        sockPost.onopen = () => {
          for (const message of this.messageArray0) {
            this._sockets[0].send(JSON.stringify(message))
          }
        }
      }
      if (i === 1) {
        sockPost.onopen = () => {
          for (const message of this.messageArray2) {
            this._sockets[2].send(JSON.stringify(message))
          }
        }
      }
      if (i === 2) {
        sockPost.onopen = () => {
          for (const message of this.messageArray4) {
            this._sockets[4].send(JSON.stringify(message))
          }
        }
      }

      sockEcoute.onerror = (err) => {
        console.log('Erreur socket producer Pulsar', err)
      }

      sockEcoute.onmessage = (messageSent: MessageEvent) => {
        const receiveMsg = JSON.parse(messageSent.data)
        const streamId = Number(receiveMsg.properties.stream)
        console.log(receiveMsg)
        window.localStorage.setItem('messageId-' + topic, receiveMsg.messageId)
        const content = new Uint8Array(this.base64ToArrayBuffer(atob(receiveMsg.payload)))
        this.pulsarMessageSubject.next({ streamId, content })
      }
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
      case Streams.COLLABORATORS:
        if (this._sockets[0].readyState === 1) {
          this._sockets[0].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArray0.push(message)
          console.log('put')
        }
        break
      case Streams.METADATA:
        if (this._sockets[2].readyState === 1) {
          this._sockets[2].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArray2.push(message)
          console.log('put')
        }
        break
      case Streams.DOCUMENT_CONTENT:
        if (this._sockets[4].readyState === 1) {
          this._sockets[4].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArray4.push(message)
          console.log('put')
        }
        break
      default:
        break
    }
  }

  // waitForSocketConnection(socket, callback) {}
}
