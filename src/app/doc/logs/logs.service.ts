import { Injectable, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { environment } from '../../../environments/environment.ovhdev'
import { Doc } from '../../core/Doc'
import { LogsStrategy } from './LogsStrategy'
import { SendAllLogsStrategy } from './SendAllLogsStrategy'
import { SendIfActivateLogsStrategy } from './SendIfActivateLogsStrategy'

@Injectable()
export class LogsService implements OnDestroy {
  private subs: Subscription[]

  private docKey: string
  private displayLogs: boolean
  private strategy: LogsStrategy
  private shareLogs: boolean

  constructor(route: ActivatedRoute) {
    this.displayLogs = false
    this.subs = []

    this.subs.push(
      route.data.subscribe(({ doc }: { doc: Doc }) => {
        this.docKey = doc.signalingKey
        this.shareLogs = doc.shareLogs
        this.setLogsStrategy('sendall')
      })
    )
  }

  log(obj: object) {
    if (this.displayLogs) {
      log.info('DOC LOGS', obj['type'], obj)
    }
    // context is a Map, so it can't be stringify -> we have to convert it
    if (obj['context']) {
      const tab = {}
      obj['context'].forEach((v, k) => {
        tab[k] = v
      })
      obj['context'] = tab
    }
    if (environment.logSystem.anonimyze) {
      this.strategy.sendLogs(this.anonymize(obj), this.shareLogs)
    } else {
      this.strategy.sendLogs(obj, this.shareLogs)
    }
  }

  anonymize(obj: object): object {
    const anonymObj = JSON.parse(JSON.stringify(obj))
    /*const anonymObj = JSON.parse(
      '{"type":"remoteInsertion","siteId":1641615532,"remoteSiteId":1066527222,"remoteClock":19,"textOperation":[{"position":3,"content":"defg","length":4}, {"position":0,"content":"abc","length":3}],"logootsOperation":{"id":{"tuples":[{"random":1601314741,"replicaNumber":1066527222,"clock":1,"offset":0}]},"content":"abcdefg"},"context":{"98460867":2,"298232580":6,"505053041":1,"535413092":1,"749716843":1,"1066527222":19,"1409712801":0,"1647910861":22,"-1770682326":0,"-1161769434":12,"-553776365":1,"-370694280":13},"timestamp":1537959924894,"collaborators":[2519641653],"neighbours":{"downstream":[],"upstream":[]}}'
    )*/
    if (obj['type'] === 'localInsertion') {
      const content: string = anonymObj['operation']['content']
      let anonymContent = ''
      for (let i = 0; i < content.length; i++) {
        anonymContent += this.randomizeChar(content.charAt(i))
      }
      anonymObj['operation']['content'] = anonymContent
      anonymObj['content'] = anonymContent
    } else if (obj['type'] === 'remoteInsertion') {
      const content: string = anonymObj['operation']['content']
      let anonymContent = ''
      for (let i = 0; i < content.length; i++) {
        anonymContent += this.randomizeChar(content.charAt(i))
      }
      anonymObj['operation']['content'] = anonymContent

      const tab: object[] = anonymObj['textOperation']
      let cpt = 0
      tab
        .sort((a, b) => {
          return a['position'] - b['position']
        })
        .forEach((value) => {
          const l = value['content'].length
          value['content'] = anonymContent.substr(cpt, l)
          cpt += l
        })
    }
    return anonymObj
  }

  private randomizeChar(c: string): string {
    const character = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,?;.:/!%*$&()[]_-<>'
    const min = 0
    const max = character.length - 1
    return character.charAt(Math.floor(Math.random() * (max - min + 1)) + min)
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
