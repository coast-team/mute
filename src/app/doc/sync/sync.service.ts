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

  private replySyncObservable: Observable<RichLogootSOperation[]>
  private replySyncObservers: Observer<RichLogootSOperation[]>[] = []

  private stateObservable: Observable<State>
  private stateObservers: Observer<State>[] = []

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

    this.replySyncObservable = Observable.create((observer) => {
      this.replySyncObservers.push(observer)
    })

    this.stateObservable = Observable.create((observer) => {
      this.stateObservers.push(observer)
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

  get onReplySync (): Observable<RichLogootSOperation[]> {
    return this.replySyncObservable
  }

  get onState (): Observable<State> {
    return this.stateObservable
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

      this.updateState(richLogootSOp)

      this.stateObservers.forEach((observer: Observer<State>) => {
        observer.next(this.state)
      })

      this.localRichLogootSOperationObservers.forEach((observer: Observer<RichLogootSOperation>) => {
        observer.next(richLogootSOp)
      })

      this.clock++
    })
  }

  set remoteQuerySyncSource (source: Observable<Map<number, number>>) {
    source.subscribe((vector: Map<number, number>) => {
      const missingRichLogootSOps: RichLogootSOperation[] = this.richLogootSOps.filter((richLogootSOperation: RichLogootSOperation) => {
        const id: number = richLogootSOperation.id
        const clock: number = richLogootSOperation.clock
        if (vector.get(id) === undefined) {
          return true
        } else if (vector.get(id) < clock) {
          return true
        }
        return false
      })
      // TODO: Add sort function to apply LogootSAdd operations before LogootSDel ones
      this.replySyncObservers.forEach((observer: Observer<RichLogootSOperation[]>) => {
        observer.next(missingRichLogootSOps)
      })

      // TODO: Retrieve our missing operations
      // TODO: Query them
    })
  }

  set remoteReplySyncSource (source: Observable<RichLogootSOperation[]>) {
    source.subscribe((richLogootSOps: RichLogootSOperation[]) => {
      richLogootSOps.forEach((richLogootSOp: RichLogootSOperation) => {
        this.applyRichLogootSOperation(richLogootSOp)
      })

      this.stateObservers.forEach((observer: Observer<State>) => {
        observer.next(this.state)
      })
    })
  }

  set remoteRichLogootSOperationSource (source: Observable<RichLogootSOperation>) {
    source.subscribe((richLogootSOp: RichLogootSOperation) => {
      this.applyRichLogootSOperation(richLogootSOp)

      this.stateObservers.forEach((observer: Observer<State>) => {
        observer.next(this.state)
      })
    })
  }

  set storedStateSource (source: Observable<State>) {
    source.subscribe((state: State) => {
      this.vector.clear()
      this.richLogootSOps = state.richLogootSOps
      this.richLogootSOps.forEach((richLogootSOp: RichLogootSOperation) => {
        this.applyRichLogootSOperation(richLogootSOp)
      })
    })
  }

  applyRichLogootSOperation (richLogootSOp: RichLogootSOperation): void {
    this.updateState(richLogootSOp)
    this.remoteLogootSOperationObservers.forEach((observer: Observer<LogootSAdd | LogootSDel>) => {
      observer.next(richLogootSOp.logootSOp)
    })
  }

  updateState (richLogootSOp: RichLogootSOperation): void {
    this.updateVector(richLogootSOp.id, richLogootSOp.clock)
    this.richLogootSOps.push(richLogootSOp)
  }

  updateVector (id: number, clock: number): void {
    if (this.vector.get(id) < clock) {
      this.vector.set(id, clock)
    }

    // TODO: Check if operation had previously been received
    // TODO: Check if some operations are missing
  }

}
