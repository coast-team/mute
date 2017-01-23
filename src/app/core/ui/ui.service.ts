import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs/Rx'

@Injectable()
export class UiService {

  private navToggleSubject: BehaviorSubject<boolean>
  private docNavToggleSubject: BehaviorSubject<boolean>

  public navOpened = false
  public docNavOpened = true

  constructor () {
    this.navToggleSubject = new BehaviorSubject<boolean>(this.navOpened)
    this.docNavToggleSubject = new BehaviorSubject<boolean>(this.docNavOpened)
  }

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

  get onDocNavToggle (): Observable<boolean> {
    return this.docNavToggleSubject.asObservable()
  }

  openDocNav (): void {
    this.docNavToggleSubject.next(true)
    this.docNavOpened = true
  }

  closeDocNav (): void {
    this.docNavToggleSubject.next(false)
    this.docNavOpened = false
  }

  toggleDocNav (): void {
    this.docNavOpened = !this.docNavOpened
    this.docNavToggleSubject.next(this.docNavOpened)
  }

}
