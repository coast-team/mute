import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'
import { RabbitMq } from './RabbitMq'

@Injectable()
export class LogsService {
  private dbLocal: Database
  private dbDistante: RabbitMq

  private displayLogs: boolean

  constructor() {
    this.displayLogs = false
  }

  init(docKey: string) {
    // Initialize the local DB
    this.dbLocal = new IndexdbDatabase()
    this.dbLocal.init('muteLogs-' + docKey)

    // Initialize the distant DB
    this.dbDistante = new RabbitMq(docKey)
  }

  log(obj: object) {
    if (this.displayLogs) {
      log.info('DOC LOGS', obj)
    }

    this.dbLocal.store(obj)
    this.dbDistante.send(obj)
  }

  getLogs(): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.dbLocal
        .get()
        .then((obj: object) => {
          resolve(obj as object[])
        })
        .catch((err) => reject(err))
    })
  }

  public setDisplayLogs(display: boolean) {
    this.displayLogs = display
  }
}
