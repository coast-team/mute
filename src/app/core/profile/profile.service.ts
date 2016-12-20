import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs/Rx'


@Injectable()
export class ProfileService {

  private storagePrefix = 'mute'
  private pseudonymDefault = 'Anonymous'
  private pseudoSubject: BehaviorSubject<string>

  constructor () {
    this.pseudoSubject = new BehaviorSubject<string>(this.pseudonym)
  }

  get pseudonym () {
    let pseudonym = this.getItem('pseudonym')
    if (pseudonym === null) {
      return this.pseudonymDefault
    }
    return pseudonym
  }

  get onPseudonym (): Observable<string> {
    return this.pseudoSubject.asObservable()
  }

  set pseudonym (value) {
    if (value !== '') {
      this.setItem('pseudonym', value)
    } else {
      this.removeItem('pseudonym')
    }
    this.pseudoSubject.next(this.pseudonym)
  }

  private setItem (key, value) {
    localStorage.setItem(this.storagePrefix + key, value)
  }

  private getItem (key) {
    return localStorage.getItem(this.storagePrefix + key)
  }

  private removeItem (key) {
    localStorage.removeItem(this.storagePrefix + key)
  }

}
