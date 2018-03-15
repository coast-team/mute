import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { bufferTime, filter } from 'rxjs/operators'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local-storage.service'

import { RichLogootSOperation, State } from 'mute-core'

@Injectable()
export class SyncStorageService {

  private doc: Doc

  private storedStateObservable: Observable<State>
  private storedStateObservers: Array<Observer<State>> = []

  constructor (private storage: LocalStorageService) {
    this.storedStateObservable = Observable.create((observer) => {
      this.storedStateObservers.push(observer)
    })
  }

  set initSource (source: Observable<Doc>) {
    source.subscribe((doc: Doc) => {
      this.doc = doc
      this.storage.getDocBody(doc)
        .then((data: any) => {
          const richLogootSOps: RichLogootSOperation[] = data.richLogootSOps
            .map((richLogootSOp) => RichLogootSOperation.fromPlain(richLogootSOp))
            .filter((richLogootSOp) => richLogootSOp instanceof RichLogootSOperation)
          this.storedStateObservers.forEach((observer: Observer<State>) => {
            observer.next(new State(new Map(), richLogootSOps))
          })
        })
        .catch(() => {
          this.storedStateObservers.forEach((observer: Observer<State>) => {
            observer.next(new State(new Map(), []))
          })
        })
    })
  }

  set stateSource (source: Observable<State>) {
    source.pipe(
      bufferTime(750),
      filter((states: State[]) => states.length > 0)
    ).subscribe((states: State[]) => {
      const lastIndex = states.length - 1
      this.storage.saveDocBody(this.doc, states[lastIndex])
    })
  }

  get onStoredState (): Observable<State> {
    return this.storedStateObservable
  }
}
