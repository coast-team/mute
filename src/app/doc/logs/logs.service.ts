import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'

@Injectable()
export class LogsService {
  private db: Database
  private displayLogs: boolean

  constructor() {
    this.db = new IndexdbDatabase()
    this.displayLogs = false
  }

  init(databaseName: string) {
    this.db.init(databaseName)
  }

  log(obj: object) {
    // context is a Map, so it can't be stringify -> we have to convert it
    if (obj['context']) {
      const tab = {}
      obj['context'].forEach((v, k) => {
        tab[k] = v
      })
      obj['context'] = tab
    }
    this.db.store(obj)
    if (this.displayLogs) {
      log.info('DOC LOGS', obj)
    }
  }

  getLogs(): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.db
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
