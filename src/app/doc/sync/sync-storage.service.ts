import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'

import { JoinEvent } from 'doc/network'
import { LocalStorageService } from 'core/storage/local-storage/local-storage.service'
import { RichLogootSOperation } from './RichLogootSOperation'
import { State } from './State'

@Injectable()
export class SyncStorageService {

  private key: string

  private storedStateObservable: Observable<State>
  private storedStateObservers: Observer<State>[] = []

  constructor (private localStorageService: LocalStorageService) {
    this.storedStateObservable = Observable.create((observer) => {
      this.storedStateObservers.push(observer)
    })
  }

  set joinSource (source: Observable<JoinEvent>) {
    source.subscribe((joinEvent: JoinEvent) => {
      this.key = joinEvent.key
      this.localStorageService.get(this.storageId)
        .then((data: any) => {
          const richLogootSOps: RichLogootSOperation[] = data.richLogootSOps
            .map((richLogootSOp: any): RichLogootSOperation | null => {
              return RichLogootSOperation.fromPlain(richLogootSOp)
            })
            .filter((richLogootSOp: RichLogootSOperation | null) => {
              return richLogootSOp instanceof RichLogootSOperation
            })
          this.storedStateObservers.forEach((observer: Observer<State>) => {
            observer.next(new State(new Map(), richLogootSOps))
          })
        }, () => {
          this.storedStateObservers.forEach((observer: Observer<State>) => {
            observer.next(new State(new Map(), []))
          })
        })
    })
  }

  set stateSource (source: Observable<State>) {
    source.subscribe((state: State) => {
      this.localStorageService.put(this.storageId, state)
    })
  }

  get storageId(): string {
    return this.constructor.name + '-' + this.key
  }

  get onStoredState(): Observable<State> {
    return this.storedStateObservable
  }
}
