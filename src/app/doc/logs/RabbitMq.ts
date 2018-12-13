import { StompConfig, StompService } from '@stomp/ng2-stompjs'

import { environment } from '../../../environments/environment'

export class RabbitMq extends StompService {
  private queue: string
  private key: string

  private queueLength: number
  private localName: string

  constructor(docKey: string) {
    const config = new StompConfig()
    config.url = environment.logSystem.logCollectorUrl
    config.headers = { login: 'guest', passcode: 'guest' }
    config.debug = environment.logSystem.stompjsDebugLog
    config.heartbeat_in = 0
    config.heartbeat_out = 20000
    config.reconnect_delay = 5000
    super(config)

    this.queue = '/queue/muteLogs'
    this.key = docKey
    this.queueLength = this._queuedMessages.length
    this.localName = 'offline-logs-' + this.key

    if (window.localStorage.getItem(this.localName) === null) {
      // The local storage is empty, we initialize the offline save with an empty array
      window.localStorage.setItem(this.localName, JSON.stringify([]))
    } else {
      // The localstorage have some logs, we add them into the queue
      const oldLogs = JSON.parse(window.localStorage.getItem(this.localName)) as string[]
      oldLogs.forEach((log, key) => {
        this._queuedMessages.push({ destination: this.queue, body: log, headers: this.client.connectHeaders })
      })
    }
  }

  public send(data: object): void {
    const obj = JSON.stringify({ collection: this.key, data })
    this.publish(this.queue, obj)

    if (this._queuedMessages.length > this.queueLength) {
      const oldLogs = JSON.parse(window.localStorage.getItem(this.localName)) as string[]
      oldLogs.push(obj)
      window.localStorage.setItem(this.localName, JSON.stringify(oldLogs))
      this.queueLength = this._queuedMessages.length
    }
  }

  protected sendQueuedMessages(): void {
    const queuedMessages = this._queuedMessages
    this._queuedMessages = []
    this.queueLength = 0
    window.localStorage.setItem(this.localName, JSON.stringify([]))

    this._debug(`Will try sending queued messages ${queuedMessages}`)

    for (const queuedMessage of queuedMessages) {
      this._debug(`Attempting to send ${queuedMessage}`)
      this.publish(queuedMessage)
    }
  }
}
