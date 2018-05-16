import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'
import { auditTime } from 'rxjs/operators'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'

import { RichLogootSOperation, State } from 'mute-core'

@Injectable()
export class SyncStorageService {
  private doc: Doc

  private storedStateObservable: Observable<State>
  private storedStateObservers: Array<Observer<State>> = []

  constructor(private storage: LocalStorageService) {
    this.storedStateObservable = Observable.create((observer) => {
      this.storedStateObservers.push(observer)
    })
  }

  set initSource(source: Observable<Doc>) {
    source.subscribe((doc: Doc) => {
      this.doc = doc
      this.storage
        .getDocBody(doc)
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

  set stateSource(source: Observable<State>) {
    source.pipe(auditTime(2000)).subscribe((state) => this.storage.saveDocBody(this.doc, state))
  }

  get onStoredState(): Observable<State> {
    return this.storedStateObservable
  }
}
