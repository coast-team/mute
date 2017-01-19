import { Injectable } from '@angular/core'
import { LogootSDel, LogootSAdd } from 'mute-structs'
import { Observable, Observer } from 'rxjs'

import { RichLogootSOperation } from './RichLogootSOperation'
import { State } from './State'

import { JoinEvent } from 'doc/network'

@Injectable()
export class SyncService {

  private id: number = -1
  private clock: number = 0
  private vector: Map<number, number> = new Map()
  private richLogootSOps: RichLogootSOperation[] = []

  private localRichLogootSOperationObservable: Observable<RichLogootSOperation>
  private localRichLogootSOperationObservers: Observer<RichLogootSOperation>[] = []

  private querySyncObservable: Observable<Map<number, number>>
  private querySyncObservers: Observer<Map<number, number>>[] = []

  private remoteLogootSOperationObservable: Observable<LogootSAdd | LogootSDel>
  private remoteLogootSOperationObservers: Observer<LogootSAdd | LogootSDel>[] = []

  constructor () {
    this.localRichLogootSOperationObservable = Observable.create((observer) => {
      this.localRichLogootSOperationObservers.push(observer)
    })

    this.querySyncObservable = Observable.create((observer) => {
      this.querySyncObservers.push(observer)
    })

    this.remoteLogootSOperationObservable = Observable.create((observer) => {
      this.remoteLogootSOperationObservers.push(observer)
    })

  }

  get onLocalRichLogootSOperation (): Observable<RichLogootSOperation> {
    return this.localRichLogootSOperationObservable
  }

  get onQuerySync (): Observable<Map<number, number>> {
    return this.querySyncObservable
  }

  get onRemoteLogootSOperation (): Observable<LogootSAdd | LogootSDel> {
    return this.remoteLogootSOperationObservable
  }

  get state (): State {
    return new State(this.vector, this.richLogootSOps)
  }

  set joinSource (source: Observable<JoinEvent>) {
    source.subscribe((joinEvent: JoinEvent) => {
      this.id = joinEvent.id
    })
  }

  set localLogootSOperationSource (source: Observable<LogootSAdd | LogootSDel>) {
    source.subscribe((logootSOp: LogootSAdd | LogootSDel) => {
      const richLogootSOp: RichLogootSOperation = new RichLogootSOperation(this.id, this.clock, logootSOp)

      this.updateVector(this.id, this.clock)
      this.richLogootSOps.push(richLogootSOp)
      this.localRichLogootSOperationObservers.forEach((observer: Observer<RichLogootSOperation>) => {
        observer.next(richLogootSOp)
      })

      this.clock++
    })
  }

  set queryDocSource (source: Observable<void>) {
    source.subscribe(() => {
      this.querySyncObservers.forEach((observer: Observer<Map<number, number>>) => {
        observer.next(this.vector)
      })
    })
  }

  set remoteRichLogootSOperationSource (source: Observable<RichLogootSOperation>) {
    source.subscribe((richLogootSOp: RichLogootSOperation) => {
      this.applyRichLogootSOperation(richLogootSOp)
    })
  }

  applyRichLogootSOperation (richLogootSOp: RichLogootSOperation): void {
    this.updateVector(richLogootSOp.id, richLogootSOp.clock)
    this.richLogootSOps.push(richLogootSOp)
    this.remoteLogootSOperationObservers.forEach((observer: Observer<LogootSAdd | LogootSDel>) => {
      observer.next(richLogootSOp.logootSOp)
    })
  }

  updateVector (id: number, clock: number): void {
    if (this.vector.get(id) < clock) {
      this.vector.set(id, clock)
    }

    // TODO: Check if operation had previously been received
    // TODO: Check if some operations are missing
  }

}
