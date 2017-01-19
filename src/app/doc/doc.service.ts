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
import { LocalStorageService } from 'core/storage/local-storage/local-storage.service'

@Injectable()
export class DocService {

  private doc: LogootSRopes
  private docID: string

  private docValueObservable: Observable<string>
  private docValueObservers: Observer<string>[] = []

  private localLogootSOperationObservable: Observable<LogootSAdd | LogootSDel>
  private localLogootSOperationObservers: Observer<LogootSAdd | LogootSDel>[] = []

  private queryDocObservable: Observable<void>
  private queryDocObservers: Observer<void>[] = []

  private remoteTextOperationsObservable: Observable<TextInsert[] | TextDelete[]>
  private remoteTextOperationsObservers: Observer<TextInsert[] | TextDelete[]>[] = []

  private joinSubscription: Subscription
  private localOperationsSubscription: Subscription
  private messageSubscription: Subscription

  constructor (
    private localStorageService: LocalStorageService,
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

    this.queryDocObservable = Observable.create((observer) => {
      this.queryDocObservers.push(observer)
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
      if (!joinEvent.created) {
        // Have to retrieve the document from another peer
        this.queryDocObservers.forEach((observer: Observer<void>) => {
          observer.next(undefined)
        })
      }
      /*
      else {
        // Try to retrieve the document from the local database
        this.localStorageService.get(this.docID)
        .then((plainDoc: any) => {
          const doc: LogootSRopes | null = this.generateDoc(plainDoc)

          if (doc instanceof LogootSRopes) {
            this.doc = doc
          } else {
            // TODO: Handle this error properly
            log.error('logootsropes:doc', 'retrieved invalid document')
            this.doc = new LogootSRopes(joinEvent.id)
          }
          this.docValueObserver.next(this.doc.str)
        }, () => {
          // Was not able to retrieve the document
          // Create a new one
          this.doc = new LogootSRopes(joinEvent.id)
          this.docValueObserver.next(this.doc.str)
        })
      }
      */
    })
  }

  get onDocValue (): Observable<string> {
    return this.docValueObservable
  }

  get onLocalLogootSOperation (): Observable<LogootSAdd | LogootSDel> {
    return this.localLogootSOperationObservable
  }

  get onQueryDoc (): Observable<void> {
    return this.queryDocObservable
  }

  get onRemoteTextOperations (): Observable<TextInsert[] | TextDelete[]> {
    return this.remoteTextOperationsObservable
  }

  generateDoc (plainDoc: any): LogootSRopes | null {
    const myId: number = this.network.myId
    const clock = 0

    return LogootSRopes.fromPlain(myId, clock, plainDoc)
  }

  saveDoc (): void {
    this.localStorageService.put(this.docID, { root: this.doc.root, str: this.doc.str })
    .then(() => {}, () => {
      // TODO: Handle this error properly
    })
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
    this.saveDoc()
    log.info('operation:doc', 'updated doc: ', this.doc)
  }

  handleRemoteOperation (logootSOperation: LogootSAdd | LogootSDel): TextInsert[] | TextDelete[] {
    const textOperations: TextInsert[] | TextDelete[] = logootSOperation.execute(this.doc)
    this.saveDoc()
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
