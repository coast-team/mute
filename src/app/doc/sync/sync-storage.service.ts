import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'

import { LocalStorageService } from '../../core/storage/local-storage/local-storage.service'

import { JoinEvent, RichLogootSOperation, State } from 'mute-core'


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
      this.localStorageService.get(this.key)
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
    source
      .bufferTime(750)
      .filter((states: State[]) => states.length > 0)
      .subscribe((states: State[]) => {
        const lastIndex = states.length - 1
        this.localStorageService.put(this.key, states[lastIndex])
      })
  }

  get onStoredState(): Observable<State> {
    return this.storedStateObservable
  }
}
