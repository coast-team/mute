import { Injectable } from '@angular/core'
import { TextDelete, TextInsert } from 'mute-structs'
import { Observable, Observer } from 'rxjs'

@Injectable()
export class EditorService {

  private localOperationsObservable: Observable<(TextInsert | TextDelete)[][]>
  private localOperationsObserver: Observer<(TextInsert | TextDelete)[][]>

  constructor () {
    log.angular('EditorService constructor')
    this.localOperationsObservable = Observable.create((observer) => {
      this.localOperationsObserver = observer
    })
  }

  get onLocalOperations (): Observable<(TextInsert | TextDelete)[][]> {
    return this.localOperationsObservable
  }

  emitLocalTextOperations (textOperations: (TextInsert | TextDelete)[][]): void {
    this.localOperationsObserver.next(textOperations)
  }

}
