import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'

import { Doc } from '../../core/Doc'
import { StorageService } from '../../core/storage/storage.service'

import { RichLogootSOperation, State } from 'mute-core'

@Injectable()
export class SyncStorageService {

  private doc: Doc

  private storedStateObservable: Observable<State>
  private storedStateObservers: Array<Observer<State>> = []

  constructor (private storage: StorageService) {
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
            .map((richLogootSOp: any): RichLogootSOperation | null => {
              return RichLogootSOperation.fromPlain(richLogootSOp)
            })
            .filter((richLogootSOp: RichLogootSOperation | null) => {
              return richLogootSOp instanceof RichLogootSOperation
            })
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
    source
      .bufferTime(750)
      .filter((states: State[]) => states.length > 0)
      .subscribe((states: State[]) => {
        const lastIndex = states.length - 1
        this.storage.saveDocBody(this.doc, states[lastIndex])
      })
  }

  get onStoredState (): Observable<State> {
    return this.storedStateObservable
  }
}
