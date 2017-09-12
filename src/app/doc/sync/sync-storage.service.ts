import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local-storage/local-storage.service'

import { JoinEvent, RichLogootSOperation, State } from 'mute-core'


@Injectable()
export class SyncStorageService {

  private doc: Doc

  private storedStateObservable: Observable<State>
  private storedStateObservers: Observer<State>[] = []

  constructor (private localStorageService: LocalStorageService) {
    this.storedStateObservable = Observable.create((observer) => {
      this.storedStateObservers.push(observer)
    })
  }

  set initSource (source: Observable<Doc>) {
    source.subscribe((doc: Doc) => {
      this.doc = doc
      this.localStorageService.getBody(doc)
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
        .catch((err) => {
          log.info('Document\' local content is empty')
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
        this.localStorageService.save(this.doc, states[lastIndex])
      })
  }

  get onStoredState (): Observable<State> {
    return this.storedStateObservable
  }
}
