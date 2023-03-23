import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { StreamId, Streams, StreamsSubtype } from '@coast-team/mute-core'

import { environment } from '@environments/environment'

export const enum WebSocketReadyState {
  /** The connection is not yet open. */
  CONNECTING = 0,
  /** The connection is open and ready to communicate. */
  OPEN = 1,
  /** The connection is in the process of closing. */
  CLOSING = 2,
  /** The connection is closed or couldn't be opened. */
  CLOSED = 3
}

@Injectable()
export class PulsarService {
  private messageArrayMetadata = []
  private messageArrayDocContent = []
  private messageArrayLogs = []

  public _sockets: WebSocket[] = []
  public _socketsLogs: WebSocket[] = []

  public pulsarMessageSubject: Subject<{ streamId: Streams; content: Uint8Array }>
  public pulsarWebSocketsSubject: Subject<{ webSocketsArray: WebSocket[] }>
  public pulsarWebSocketsLogsSubject: Subject<{ webSocketsArray: WebSocket[] }>

  constructor () {
    this.pulsarMessageSubject = new Subject()
    this.pulsarWebSocketsSubject = new Subject()
    this.pulsarWebSocketsLogsSubject = new Subject()
  }

  get pulsarMessage$ (): Observable<{ streamId: Streams; content: Uint8Array }> {
    return this.pulsarMessageSubject.asObservable()
  }

  get pulsarWebsockets$ (): Observable<{ webSocketsArray: WebSocket[] }> {
    return this.pulsarWebSocketsSubject.asObservable()
  }

  get pulsarWebsocketsLogs$ (): Observable<{ webSocketsArray: WebSocket[] }> {
    return this.pulsarWebSocketsLogsSubject.asObservable()
  }

  set sockets (topic: string) {
    const docType = 400

    this.closeSocketConnexion('setsocket') // in case websockets are not closed yet

    this.getMessageFromLocalStorage(topic)

    for (let i = 1; i < 3; i++) {
      const sockPost = new WebSocket(`${environment.pulsar.wsURL}/producer/persistent/public/default/${docType + i}-${topic}`)
      const sockListen = this.createWsListen(topic, i)

      this.socketPostConfig(sockPost, i, topic)
      this.socketListenConfig(sockListen, i, topic)

      this._sockets.push(sockPost)
      this._sockets.push(sockListen)
    }
    this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })
    console.log(this._sockets)
  }

  set socketsLogs (topic: string) {
    const sockPost = new WebSocket(`${environment.pulsar.wsURL}/producer/persistent/public/default/Logs-${topic}`)

    this.socketPostConfig(sockPost, 3, topic)

    this._socketsLogs.push(sockPost)
    this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
    console.log(this._socketsLogs)
  }

  sendMessageToPulsar (streamId: StreamId, keyTopic: string, content: Uint8Array) {
    const content64 = this.arrayBufferToBase64(content)
    const message = {
      payload: btoa(content64),
      properties: {
        streamType: streamId.type,
        streamSubtype: streamId.subtype,
        topic: keyTopic,
      }
    }

    switch (streamId.type) {
      case Streams.METADATA:
        if (this._sockets[0].readyState === WebSocketReadyState.OPEN) {
          this._sockets[0].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArrayMetadata.push(JSON.stringify(message))
          window.localStorage.setItem('msgPulsarMetadata' + keyTopic, JSON.stringify(this.messageArrayMetadata))
          console.log('PUT', content)
        }
        break

      case Streams.DOCUMENT_CONTENT:
        if (this._sockets[2].readyState === WebSocketReadyState.OPEN) {
          this._sockets[2].send(JSON.stringify(message))
          console.log('SENT', content)
        } else {
          this.messageArrayDocContent.push(JSON.stringify(message))
          window.localStorage.setItem('msgPulsarDocContent' + keyTopic, JSON.stringify(this.messageArrayDocContent))
          console.log('PUT', content)
        }
        break

      default:
        break
    }
  }

  sendLogsToPulsar (keyTopic: string, obj: string) {
    const message = {
      payload: btoa(obj),
      properties: {
        streamType: Streams.METADATA,
        streamSubtype: StreamsSubtype.METADATA_LOGS,
        topic: keyTopic
      }
    }

    if (this._socketsLogs[0].readyState === WebSocketReadyState.OPEN) {
      this._socketsLogs[0].send(JSON.stringify(message))
      console.log('SENT', message)
    } else {
      this.messageArrayLogs.push(JSON.stringify(message))
      window.localStorage.setItem('msgPulsarLogs' + keyTopic, JSON.stringify(this.messageArrayLogs))
      console.log('PUT')
    }
  }

  createWsListen (topic: string, i: number): WebSocket {
    const docType = 400
    let urlEnd: string

    if (i === 3) {
      urlEnd = 'Logs'
    } else {
      urlEnd = (docType + i).toString()
    }

    const msgIdFromStorage = window.localStorage.getItem('msgId-' + urlEnd + '-' + topic)
    // if (true) {
    if (msgIdFromStorage === null || msgIdFromStorage === 'null') {
      return new WebSocket(`${environment.pulsar.wsURL}/reader/persistent/public/default/${urlEnd}-${topic}/?messageId=earliest`)
    } else {
      return new WebSocket(`${environment.pulsar.wsURL}/reader/persistent/public/default/${urlEnd}-${topic}/?messageId=${msgIdFromStorage}`)
    }
  }

  socketPostConfig (sockPost: WebSocket, i: number, topic: string) {
    const docType = 400

    sockPost.onerror = (err) => {
      console.log('Error on Pulsar producer socket', err)
    }
    // reception de messages, le producteur ne recevra que des acks
    sockPost.onmessage = (messageSent: MessageEvent) => {
      console.log('ACK received: ', messageSent.data)
    }

    let sock
    let sockNumber
    let array

    if (i === 1) {
      sock = this._sockets
      sockNumber = 0
      array = this.messageArrayMetadata
    } else if (i === 2) {
      sock = this._sockets
      sockNumber = 2
      array = this.messageArrayDocContent
    } else if (i === 3) {
      sock = this._socketsLogs
      sockNumber = 0
      array = this.messageArrayLogs
    }

    sockPost.onopen = () => {
      this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
      this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })

      for (const message of array) {
        sock[sockNumber].send(message)
      }
      if (i === 1) {
        window.localStorage.removeItem('msgPulsarMetadata' + topic)
      } else if (i === 2) {
        window.localStorage.removeItem('msgPulsarDocContent' + topic)
      } else if (i === 3) {
        window.localStorage.removeItem('msgPulsarLogs' + topic)
      }
    }

    sockPost.onclose = (event) => {
      this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
      this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })

      console.log('socket: ' + sockPost.url + ' fermee\n', event)
      let urlEnd: string

      if (i === 3) {
        urlEnd = 'Logs'
      } else {
        urlEnd = (docType + i).toString()
      }
      
      console.log('Raison fermeture socket', event.reason)
      console.log('event code', event.code)

      if (event.reason !== 'networkService') {
        // closed in network Service
        if (event.code !== 1006) {
          // 1006 abnormal closure: in that case, you will not be able to connect ever again
          setTimeout(() => {
            const newWs = new WebSocket(`${environment.pulsar.wsURL}/producer/persistent/public/default/${urlEnd}-${topic}`)
            this.socketPostConfig(newWs, i, topic)
            sock[sockNumber] = newWs

            console.log('On refait une socket dans 10s oui', sock)

            this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
            this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })
          }, 10000)
        }
      }
      console.log('les sockets \n', this.socketsReadystate())
    }
  }

  socketListenConfig (socketListen: WebSocket, i: number, topic: string) {
    const docType = 400

    socketListen.onerror = (err) => {
      console.log('Error on Pulsar producer socket', err)
    }

    socketListen.onopen = () => {
      this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
      this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })
    }

    socketListen.onmessage = (messageSent: MessageEvent) => {
      // console.log('MESSAGE RECEIVED', messageSent)
      const receiveMsg = JSON.parse(messageSent.data)
      const streamId = Number(receiveMsg.properties.streamType)
      console.log('DATA RECEIVED', receiveMsg)

      let urlEnd: string

      if (i === 3) {
        urlEnd = 'Logs'
      } else {
        urlEnd = (docType + i).toString()
      }

      window.localStorage.setItem('msgId-' + urlEnd + '-' + topic, receiveMsg.messageId)

      const content = new Uint8Array(this.base64ToArrayBuffer(atob(receiveMsg.payload)))
      this.pulsarMessageSubject.next({ streamId, content })
    }

    socketListen.onclose = (event) => {
      this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
      this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })

      console.log('event code', event.code)

      console.log('socket: ' + socketListen.url + ' closed\n', event)
      if (event.reason !== 'networkService') {
        if (event.code !== 1006) {
          setTimeout(() => {
            const newWs = this.createWsListen(topic, i)
            this.socketListenConfig(newWs, i, topic)
            if (i === 1) {
              this._sockets[1] = newWs
            } else if (i === 2) {
              this._sockets[3] = newWs
            } else if (i === 3) {
              this._socketsLogs[1] = newWs
            }
            this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
            this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })
          }, 10000)
          this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
          this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })

          console.log('On refait une socket ecoute dans 10s ' + i)
        }
      }
      this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })
      console.log('les sockets \n ', this.socketsReadystate())
    }
  }

  closeSocketConnexion (location: string) {
    if (this._sockets.length !== 0) {
      while (this._sockets.length !== 0) {
        this._sockets.pop().close(1000, location)
      }
      console.log('WebSockets successfuly closed at ' + location, this._sockets)
      this.pulsarWebSocketsSubject.next({ webSocketsArray: this._sockets })
    } else {
      console.log('No socket to close.\n')
    }
  }

  closeSocketLogsConnexion (location: string) {
    if (this._socketsLogs.length !== 0) {
      while (this._socketsLogs.length !== 0) {
        this._socketsLogs.pop().close(1000, location)
      }
      console.log('WebSockets successfuly closed at ' + location, this._socketsLogs)
      this.pulsarWebSocketsLogsSubject.next({ webSocketsArray: this._socketsLogs })
    } else {
      console.log('No socket to close.\n')
    }
  }

  socketsReadystate (): number[] {
    const sockStateArray: number[] = []
    for (const sock of this._sockets) {
      sockStateArray.push(sock.readyState)
    }
    return sockStateArray
  }

  getMessageFromLocalStorage (topic: string) {
    const localStorageMsgMetadata = window.localStorage.getItem('msgPulsarMetadata' + topic)
    const localStorageMsgDocContent = window.localStorage.getItem('msgPulsarDocContent' + topic)
    // const localStorageMsglogs = window.localStorage.getItem('msgPulsarLogs' + topic)

    this.messageArrayMetadata =
      localStorageMsgMetadata === 'null' || localStorageMsgMetadata === null ? [] : JSON.parse(localStorageMsgMetadata)
    this.messageArrayDocContent =
      localStorageMsgDocContent === 'null' || localStorageMsgDocContent === null ? [] : JSON.parse(localStorageMsgDocContent)
    // this.messageArrayLogs = localStorageMsglogs === 'null' || localStorageMsglogs === null ? [] : JSON.parse(localStorageMsglogs)
  }
  private arrayBufferToBase64 (buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  private base64ToArrayBuffer (base64) {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }
}
