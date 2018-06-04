import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'

@Injectable()
export class LogsService {
  private db: Database
  private displayLogs: boolean

  constructor(databaseName: string) {
    this.db = new IndexdbDatabase()
    this.db.init(databaseName)
    this.displayLogs = false
  }

  log(obj: object) {
    this.db.store(obj)
    if (this.displayLogs) {
      console.log('[LOGS]', obj)
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
