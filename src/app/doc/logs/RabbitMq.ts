import { StompConfig, StompRService, StompService, StompState } from '@stomp/ng2-stompjs'
import { Message } from '@stomp/stompjs'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Database } from './Database'

export class RabbitMq extends StompService {

  private queue: string
  private key: string

  private queueLength: number
  private localName: string

  constructor (docKey: string) {
    const config = new StompConfig()
    config.url = 'ws://localhost:15674/ws'
    config.headers = { login: 'guest', passcode: 'guest' }
    config.debug = true
    config.heartbeat_in = 0
    config.heartbeat_out = 20000
    config.reconnect_delay = 5000
    super(config)

    this.queue = '/queue/muteLogs'
    this.key = docKey
    this.queueLength = this.queuedMessages.length
    this.localName = 'offline-logs-' + this.key

    if (window.localStorage.getItem(this.localName) === null) {
      // The local storage is empty, we initialize the offline save with an empty array
      window.localStorage.setItem(this.localName, JSON.stringify([]))
    } else {
      // The localstorage have some logs, we add them into the queue
      const oldLogs = JSON.parse(window.localStorage.getItem(this.localName)) as string[]
      oldLogs.forEach((log, key) => {
        this.queuedMessages.push({ queueName: this.queue, message: log, headers: this.client.ws.headers })
      })
    }
  }

  public send (data: object): void {
    const obj = JSON.stringify({ collection: this.key, data })
    this.publish(this.queue, obj)

    if (this.queuedMessages.length > this.queueLength) {
      const oldLogs = JSON.parse(window.localStorage.getItem(this.localName)) as string[]
      oldLogs.push(obj)
      window.localStorage.setItem(this.localName, JSON.stringify(oldLogs))
      this.queueLength = this.queuedMessages.length
    }
  }

  protected sendQueuedMessages (): void {
    const queuedMessages = this.queuedMessages
    this.queuedMessages = []
    this.queueLength = 0
    window.localStorage.setItem(this.localName, JSON.stringify([]))

    this.debug(`Will try sending queued messages ${queuedMessages}`)

    for (const queuedMessage of queuedMessages) {
      this.debug(`Attempting to send ${queuedMessage}`)
      this.publish(queuedMessage.queueName, queuedMessage.message, queuedMessage.headers)
    }

  }
}
