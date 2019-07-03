import { Injectable, OnDestroy } from '@angular/core'
import { Streams } from '@coast-team/mute-core'
import { Observable, Subject } from 'rxjs'
@Injectable()
export class PulsarService implements OnDestroy {
  private messageArray = []
  public _sockets: WebSocket[] = []
  public pulsarMessageSubject: Subject<{ streamId: number; content: Uint8Array }>
  constructor() {
    this.pulsarMessageSubject = new Subject()
  }
  ngOnDestroy() {
    // couper lien avec Pulsar ici
  }
  get pulsarMessage$(): Observable<{ streamId: number; content: Uint8Array }> {
    return this.pulsarMessageSubject.asObservable()
  }

  set sockets(topic: string) {
    const docType = 400
    const encoder = new TextEncoder()
    for (let i = 0; i < 3; i++) {
      const sockPost = new WebSocket('ws://localhost:8080/ws/v2/producer/persistent/public/default/' + (docType + i) + '-' + topic)
      const sockEcoute = new WebSocket(
        'ws://localhost:8080/ws/v2/reader/persistent/public/default/' + (docType + i) + '-' + topic + '/?messageId=earliest'
      )
      sockPost.onerror = (err) => {
        console.log('Erreur socket producer Pulsar', err)
      }

      // reception de messages, le producteur ne recevra que des acks
      sockPost.onmessage = (messageSent: MessageEvent) => {
        console.log('ack received : ', messageSent.data)
      }
      sockEcoute.onerror = (err) => {
        console.log('Erreur socket producer Pulsar', err)
      }

      sockEcoute.onmessage = (messageSent: MessageEvent) => {
        const receiveMsg = JSON.parse(messageSent.data)
        const streamId = Number(receiveMsg.properties.stream)

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

  sendMessageToPulsar(streamId: number, keyTopic: string, content: Uint8Array) {
    const content64 = this.arrayBufferToBase64(content)
    const message = {
      payload: btoa(content64), // required
      properties: {
        // optionnal
        stream: streamId,
      },
    }
    console.log('SENT', content)

    this.messageArray.push(message)
    switch (streamId) {
      case 400:
        this._sockets[0].send(JSON.stringify(message))
        break
      case 401:
        this._sockets[2].send(JSON.stringify(message))
        break
      case 402:
        this._sockets[4].send(JSON.stringify(message))
        break
      default:
        break
    }
  }
}
