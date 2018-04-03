import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class UiService {
  private docDigestSubject: Subject<number>
  private docTreeSubject: Subject<string>
  private docNavToggleSubject: Subject<void>
  private navToggleSubject: Subject<void>

  constructor() {
    this.docDigestSubject = new Subject()
    this.docTreeSubject = new Subject()
    this.navToggleSubject = new Subject<void>()
    this.docNavToggleSubject = new Subject<void>()
  }

  get onNavToggle(): Observable<void> {
    return this.navToggleSubject.asObservable()
  }

  toggleNav(): void {
    this.navToggleSubject.next()
  }

  get onDocNavToggle(): Observable<void> {
    return this.docNavToggleSubject.asObservable()
  }

  set digest(digest: number) {
    this.docDigestSubject.next(digest)
  }

  get onDocDigest(): Observable<number> {
    return this.docDigestSubject.asObservable()
  }

  set tree(tree: string) {
    this.docTreeSubject.next(tree)
  }

  get onDocTree(): Observable<string> {
    return this.docTreeSubject.asObservable()
  }
}
