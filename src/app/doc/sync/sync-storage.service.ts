import { Injectable, OnDestroy } from '@angular/core'
import { Observable, Observer, Subscription } from 'rxjs'
import { auditTime } from 'rxjs/operators'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'

import { RichLogootSOperation, State } from 'mute-core'

@Injectable()
export class SyncStorageService implements OnDestroy {
  private doc: Doc

  private storedStateObservable: Observable<State>
  private storedStateObservers: Array<Observer<State>> = []
  private subs: Subscription[]

  constructor(private storage: LocalStorageService) {
    this.storedStateObservable = Observable.create((observer) => {
      this.storedStateObservers.push(observer)
    })
    this.subs = []
  }

  set initSource(source: Observable<Doc>) {
    this.subs.push(
      source.subscribe((doc: Doc) => {
        this.doc = doc
        this.doc
          .fetchContent()
          .then((data: State) => {
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
    )
  }

  set stateSource(source: Observable<State>) {
    this.subs.push(source.pipe(auditTime(2000)).subscribe((state) => this.doc.saveContent(state)))
  }

  get onStoredState(): Observable<State> {
    return this.storedStateObservable
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe())
  }
}
