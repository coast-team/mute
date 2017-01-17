import { Injectable } from '@angular/core'
import { LogootSDel, LogootSAdd } from 'mute-structs'
import { Observable, Observer } from 'rxjs'

import { RichLogootSOperation } from './RichLogootSOperation'

@Injectable()
export class SyncService {

  private id: number = -1
  private clock: number = 0

  private localRichLogootSOperationObservable: Observable<RichLogootSOperation>
  private localRichLogootSOperationObserver: Observer<RichLogootSOperation>

  constructor () {
    this.localRichLogootSOperationObservable = Observable.create((observer) => {
      this.localRichLogootSOperationObserver = observer
    })
  }

  get onLocalRichLogootSOperation (): Observable<RichLogootSOperation> {
    return this.localRichLogootSOperationObservable
  }

  set localLogootSOperationSource (source: Observable<LogootSAdd | LogootSDel>) {
    source.subscribe((logootSOp: LogootSAdd | LogootSDel) => {
      const richLogootSOp: RichLogootSOperation = new RichLogootSOperation(this.id, this.clock, logootSOp)

      this.localRichLogootSOperationObserver.next(richLogootSOp)

      this.clock++
    })
  }

}
