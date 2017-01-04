import { Injectable } from '@angular/core'
import { Subject, Observable } from 'rxjs/Rx'

@Injectable()
export class UiService {

  private navToggleSubject = new Subject<boolean>()

  navOpened: boolean

  constructor () { }

  get onNavToggle (): Observable<boolean> {
    return this.navToggleSubject.asObservable()
  }

  openNav (): void {
    this.navToggleSubject.next(true)
    this.navOpened = true
  }

  closeNav (): void {
    this.navToggleSubject.next(false)
    this.navOpened = false
  }

  toggleNav (): void {
    this.navOpened = !this.navOpened
    this.navToggleSubject.next(this.navOpened)
  }

}
