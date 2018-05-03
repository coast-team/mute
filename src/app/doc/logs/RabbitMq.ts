import { StompConfig, StompService } from '@stomp/ng2-stompjs'
import { Database } from './Database'

export class RabbitMq {

  private stompService: StompService
  private queue: string
  private key: string

  constructor (docKey: string) {
    this.queue = '/queue/muteLogs'
    this.key = docKey

    const config = new StompConfig()
    config.url = 'ws://localhost:15674/ws'
    config.headers = { login: 'guest', passcode: 'guest' }
    config.debug = false
    config.heartbeat_in = 0
    config.heartbeat_out = 20000
    config.reconnect_delay = 5000
    this.stompService = new StompService(config)
  }

  public send (data: object): void {
    const obj = { collection: this.key, data }
    this.stompService.publish(this.queue, JSON.stringify(obj))
  }
}
