import { Injectable, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Doc } from '../../core/Doc'
import { Database } from './Database'
import { IndexdbDatabase } from './IndexdbDatabase'
import { RabbitMq } from './RabbitMq'

@Injectable()
export class LogsService implements OnDestroy {
  private dbLocal: Database
  private dbDistante: RabbitMq

  private docKey: string
  private displayLogs: boolean
  private shareLogs: boolean

  constructor(route: ActivatedRoute) {
    this.displayLogs = false

    route.data.subscribe(({ doc }: { doc: Doc }) => {
      this.docKey = doc.signalingKey
      this.shareLogs = doc.shareLogs
    })

    // Initialize the local DB
    this.dbLocal = new IndexdbDatabase()
    this.dbLocal.init('muteLogs-' + this.docKey)

    // Initialize the distant DB
    if (this.shareLogs) {
      this.dbDistante = new RabbitMq(this.docKey)
    }
  }

  log(obj: object) {
    if (this.displayLogs) {
      log.info('DOC LOGS', obj)
    }

    this.dbLocal.store(obj)

    if (this.shareLogs) {
      this.dbDistante.send(obj)
    }
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

  toogleLogs(): void {
    this.shareLogs = !this.shareLogs
    if (this.shareLogs && this.dbDistante === null) {
      this.dbDistante = new RabbitMq(this.docKey)
    }
  }

  get isSharingLogs(): boolean {
    return this.shareLogs
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.')
  }
}
