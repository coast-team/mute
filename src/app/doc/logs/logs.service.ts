import { Injectable, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { Doc } from '../../core/Doc'
import { Database } from './Database'
import { LogsStrategy } from './LogsStrategy'
import { RabbitMq } from './RabbitMq'
import { SendAllLogsStrategy } from './SendAllLogsStrategy'
import { SendIfActivateLogsStrategy } from './SendIfActivateLogsStrategy'

@Injectable()
export class LogsService implements OnDestroy {
  private subs: Subscription[]

  private dbLocal: Database
  private dbDistante: RabbitMq

  private docKey: string
  private displayLogs: boolean
  private strategy: LogsStrategy
  private shareLogs: boolean

  constructor(route: ActivatedRoute) {
    this.displayLogs = false

    this.subs.push(
      route.data.subscribe(({ doc }: { doc: Doc }) => {
        this.docKey = doc.signalingKey
        this.shareLogs = doc.shareLogs
        this.setLogsStrategy(doc.logsStrategy)
      })
    )
  }

  log(obj: object) {
    if (this.displayLogs) {
      log.info('DOC LOGS', obj)
    }
    this.strategy.sendLogs(obj, this.shareLogs)
  }

  getLogs(): Promise<object[]> {
    return this.strategy.getLocalLogs()
  }

  public setDisplayLogs(display: boolean) {
    this.displayLogs = display
  }

  setShareLogs(share: boolean, state: Map<number, number>): void {
    if (this.shareLogs !== share) {
      this.shareLogs = share
      this.strategy.setShareLogs(share, state)
    }
  }

  get isSharingLogs(): boolean {
    return this.shareLogs
  }

  setLogsStrategy(logsStrategy: string): void {
    switch (logsStrategy) {
      case 'sendall':
        if (!(this.strategy instanceof SendAllLogsStrategy)) {
          this.strategy = new SendAllLogsStrategy(this.docKey)
        }
        break
      case 'sendifactivate':
        if (!(this.strategy instanceof SendIfActivateLogsStrategy)) {
          this.strategy = new SendIfActivateLogsStrategy(this.docKey)
        }
        break
      default:
        console.error('No Strategy Found !!')
        break
    }
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }
}
