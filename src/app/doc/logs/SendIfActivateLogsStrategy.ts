import { LogsStrategy } from './LogsStrategy'
import { RabbitMq } from './RabbitMq'

export class SendIfActivateLogsStrategy extends LogsStrategy {

  constructor (docKey: string) {
    super(docKey)
  }

  public sendLogs (obj: object, share: boolean) {
    console.log('[LOGS]', obj)
    this.dbLocal.store(obj)
    if (share) {
      this.dbDistante.send(obj)
    }
  }
}
