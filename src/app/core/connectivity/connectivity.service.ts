import { Injectable } from '@angular/core'
import { Subject, Observable } from 'rxjs'

@Injectable()
export class ConnectivityService {

  private onLineSubject: Subject<boolean>
  private previousState: boolean

  constructor () {
    this.onLineSubject = new Subject<boolean>()
    this.previousState = undefined
  }

  get onLine (): Observable<boolean> {
    return this.onLineSubject.asObservable()
  }

  testConnection (previousState: boolean) {
    if (navigator.onLine !== previousState) {
      this.previousState = navigator.onLine
      if (navigator.onLine) {
        this.onLineSubject.next(true)
      } else {
        this.onLineSubject.next(false)
      }
    }
  }

  launchTest () {
    let intervalID = setInterval(() => {
      this.testConnection(this.previousState)
    }, 10000)
  }
}
