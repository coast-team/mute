import { Injectable } from '@angular/core'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'

@Injectable()
export class LogsService {

  private db: Database

  constructor (databaseName: string) {
    this.db = new IndexdbDatabase()
    this.db.init(databaseName)
    console.log('[LOGS] Log system start')
  }

  log (obj: object) {
    this.db.store(obj)
    console.log('[LOGS]', obj)
  }

  getLogs (): void {
    this.db.get().then((obj: object) => {
      console.log('getLogs', obj)
    }).catch((err) => { console.log('[LOGS]', err) })
  }
}
