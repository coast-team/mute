import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'
import { RabbitMq } from './RabbitMq'

export abstract class LogsStrategy {
  protected dbDistante: RabbitMq
  protected dbLocal: Database

  protected docKey: string
  protected logId: number

  constructor(docKey: string) {
    this.docKey = docKey
    this.logId = parseInt(window.localStorage.getItem('logid-' + this.docKey), 10)
    if (isNaN(this.logId)) {
      this.logId = 0
      window.localStorage.setItem('logid-' + this.docKey, '0')
    }

    this.dbLocal = new IndexdbDatabase()
    this.dbLocal.init('muteLogs-' + this.docKey)

    this.dbDistante = new RabbitMq(this.docKey)
  }

  public setShareLogs(share: boolean, state: Map<number, number>) {
    const stateVector = {}
    state.forEach((v, k) => {
      stateVector[k] = v
    })
    if (share) {
      window.localStorage.setItem('shareLogs-on-' + this.docKey, JSON.stringify(stateVector))
    } else {
      window.localStorage.setItem('shareLogs-off-' + this.docKey, JSON.stringify(stateVector))
    }
  }

  public getLocalLogs(): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.dbLocal
        .get()
        .then((obj: object) => {
          resolve(obj as object[])
        })
        .catch((err) => reject(err))
    })
  }

  protected useLogId(): number {
    this.logId++
    window.localStorage.setItem('logid-' + this.docKey, this.logId + '')
    return this.logId - 1
  }

  abstract sendLogs(obj: object, share: boolean): void
}
