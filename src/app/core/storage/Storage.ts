import { BehaviorSubject, Observable } from 'rxjs'

export abstract class Storage {
  public static CHECKING = 100
  public static AVAILABLE = 101
  public status: number

  private statusSubject: BehaviorSubject<number>

  constructor() {
    this.status = Storage.CHECKING
    this.statusSubject = new BehaviorSubject(this.status)
  }

  get isAvailable() {
    return this.status === Storage.AVAILABLE
  }

  get onStatus(): Observable<number> {
    return this.statusSubject.asObservable()
  }

  protected setStatus(code: number) {
    this.status = code
    this.statusSubject.next(code)
  }
}
