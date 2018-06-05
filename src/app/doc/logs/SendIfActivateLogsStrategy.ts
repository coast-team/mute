import { LogsStrategy } from './LogsStrategy'

export class SendIfActivateLogsStrategy extends LogsStrategy {
  constructor(docKey: string) {
    super(docKey)
  }

  public sendLogs(obj: object, share: boolean) {
    this.dbLocal.store(obj)
    if (share) {
      this.dbDistante.send(obj)
    }
  }
}
