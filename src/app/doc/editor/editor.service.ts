import { Injectable } from '@angular/core'
import { TextDelete, TextInsert } from 'mute-structs'
import { Observable, Observer } from 'rxjs'

@Injectable()
export class EditorService {

  private localTextOperationsObservable: Observable<(TextInsert | TextDelete)[][]>
  private localTextOperationsObservers: Observer<(TextInsert | TextDelete)[][]>[] = []

  constructor () {
    log.angular('EditorService constructor')
    this.localTextOperationsObservable = Observable.create((observer) => {
      this.localTextOperationsObservers.push(observer)
    })
  }

  get onLocalTextOperations (): Observable<(TextInsert | TextDelete)[][]> {
    return this.localTextOperationsObservable
  }

  emitLocalTextOperations (textOperations: (TextInsert | TextDelete)[][]): void {
    this.localTextOperationsObservers.forEach((observer: Observer<(TextInsert | TextDelete)[][]>) => {
      observer.next(textOperations)
    })
  }

}
