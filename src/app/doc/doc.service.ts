import { Injectable } from '@angular/core'
import { Observable, Observer, Subscription } from 'rxjs'
import {
  LogootSAdd,
  LogootSDel,
  LogootSRopes,
  Identifier,
  TextInsert,
  TextDelete
} from 'mute-structs'

import { JoinEvent, NetworkService } from 'doc/network'

@Injectable()
export class DocService {

  private doc: LogootSRopes
  private docID: string

  private docValueObservable: Observable<string>
  private docValueObservers: Observer<string>[] = []

  private localLogootSOperationObservable: Observable<LogootSAdd | LogootSDel>
  private localLogootSOperationObservers: Observer<LogootSAdd | LogootSDel>[] = []

  private remoteTextOperationsObservable: Observable<TextInsert[] | TextDelete[]>
  private remoteTextOperationsObservers: Observer<TextInsert[] | TextDelete[]>[] = []

  private joinSubscription: Subscription
  private localOperationsSubscription: Subscription
  private messageSubscription: Subscription

  constructor (
    private network: NetworkService
  ) {
    log.angular('DocService constructor')
    this.doc = new LogootSRopes()

    this.docValueObservable = Observable.create((observer) => {
      this.docValueObservers.push(observer)
    })

    this.localLogootSOperationObservable = Observable.create((observer) => {
      this.localLogootSOperationObservers.push(observer)
    })

    this.remoteTextOperationsObservable = Observable.create((observer) => {
      this.remoteTextOperationsObservers.push(observer)
    })
  }

  set localTextOperationsSource (source: Observable<(TextDelete | TextInsert)[][]>) {
    this.localOperationsSubscription = source.subscribe((textOperations: (TextDelete | TextInsert)[][]) => {
      this.handleTextOperations(textOperations)
    })
  }

  set remoteLogootSOperationSource (source: Observable<LogootSAdd | LogootSDel>) {
    source.subscribe((logootSOp: LogootSAdd | LogootSDel) => {
      this.remoteTextOperationsObservers.forEach((observer: Observer<(TextInsert | TextDelete)[]>) => {
        observer.next(this.handleRemoteOperation(logootSOp))
      })
    })
  }

  set joinSource (source: Observable<JoinEvent>) {
    this.joinSubscription = source.subscribe( (joinEvent: JoinEvent) => {
      this.docID = joinEvent.key
      this.doc = new LogootSRopes(joinEvent.id)

      this.docValueObservers.forEach((observer: Observer<string>) => {
        observer.next(this.doc.str)
      })
    })
  }

  get onDocValue (): Observable<string> {
    return this.docValueObservable
  }

  get onLocalLogootSOperation (): Observable<LogootSAdd | LogootSDel> {
    return this.localLogootSOperationObservable
  }

  get onRemoteTextOperations (): Observable<TextInsert[] | TextDelete[]> {
    return this.remoteTextOperationsObservable
  }

  clean () {
    this.joinSubscription.unsubscribe()
    this.localOperationsSubscription.unsubscribe()
    this.messageSubscription.unsubscribe()
  }

  handleTextOperations (array: any[][]): void {
    array.forEach( (textOperations: any[]) => {
      textOperations.forEach( (textOperation: any) => {
        const logootSOperation: LogootSAdd | LogootSDel = textOperation.applyTo(this.doc)
        this.localLogootSOperationObservers.forEach((observer: Observer<LogootSAdd | LogootSDel>) => {
          observer.next(logootSOperation)
        })
      })
    })
    log.info('operation:doc', 'updated doc: ', this.doc)
  }

  handleRemoteOperation (logootSOperation: LogootSAdd | LogootSDel): TextInsert[] | TextDelete[] {
    const textOperations: TextInsert[] | TextDelete[] = logootSOperation.execute(this.doc)
    log.info('operation:doc', 'updated doc: ', this.doc)
    return textOperations
  }

  idFromIndex (index: number): {index: number, last: number, base: number[]} | null {
    let respIntnode = this.doc.searchNode(index)
    if (respIntnode !== null) {
      return {
        index: respIntnode.i,
        last: respIntnode.node.offset + respIntnode.i,
        base: respIntnode.node.block.id.base
      }
    }
    return null
  }

  indexFromId (id: Identifier): number {
    return this.doc.searchPos(id, new Array())
  }

  setTitle (title: string): void {
    log.debug('Sending title: ' + title)
    this.network.sendDocTitle(title)
  }
}
