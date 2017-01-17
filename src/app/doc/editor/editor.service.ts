import { Injectable } from '@angular/core'
import { TextDelete, TextInsert } from 'mute-structs'
import { Observable, Observer } from 'rxjs'

@Injectable()
export class EditorService {

  private localTextOperationsObservable: Observable<(TextInsert | TextDelete)[][]>
  private localTextOperationsObserver: Observer<(TextInsert | TextDelete)[][]>

  constructor () {
    log.angular('EditorService constructor')
    this.localTextOperationsObservable = Observable.create((observer) => {
      this.localTextOperationsObserver = observer
    })
  }

  get onLocalTextOperations (): Observable<(TextInsert | TextDelete)[][]> {
    return this.localTextOperationsObservable
  }

  emitLocalTextOperations (textOperations: (TextInsert | TextDelete)[][]): void {
    this.localTextOperationsObserver.next(textOperations)
  }

}
