import { ILogsStrategy } from './LogsStrategy'
import { RabbitMq } from './RabbitMq'

export class SendIfActivateLogsStrategy implements ILogsStrategy {
  private db: RabbitMq

  constructor (database: RabbitMq) {
    this.db = database
  }

  public sendLogs (obj: object, share: boolean) {
    if (share) {
      this.db.send(obj)
    }
  }
}
