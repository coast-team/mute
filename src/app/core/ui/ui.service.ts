import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { AbstractStorageService } from '../storage'
import { Folder } from '../Folder'
import { File } from '../File'

@Injectable()
export class UiService {

  private activeFileSubject: BehaviorSubject<File | null>

  private docDigestSubject: Subject<number>
  private docTreeSubject: Subject<string>

  private docNavToggleSubject: Subject<void>
  private navToggleSubject: Subject<void>
  private toolbarTitleSubject: BehaviorSubject<string>

  public activeFile: File|null

  constructor () {
    this.activeFileSubject = new BehaviorSubject(null)
    this.docDigestSubject = new Subject()
    this.docTreeSubject = new Subject()
    this.navToggleSubject = new Subject<void>()
    this.docNavToggleSubject = new Subject<void>()
    this.toolbarTitleSubject = new BehaviorSubject<string>(this.toolbarTitle)
  }

  get onActiveFile (): Observable<File> {
    return this.activeFileSubject.asObservable()
  }

  setActiveFile (file: File) {
    this.activeFile = file
    this.activeFileSubject.next(file)
  }

  get onNavToggle (): Observable<void> {
    return this.navToggleSubject.asObservable()
  }

  toggleNav (): void {
    this.navToggleSubject.next()
  }

  get onDocNavToggle (): Observable<void> {
    return this.docNavToggleSubject.asObservable()
  }

  toggleDocNav (): void {
    this.docNavToggleSubject.next()
  }

  get onToolbarTitle (): Observable<string> {
    return this.toolbarTitleSubject.asObservable()
  }

  set toolbarTitle (title) {
    this.toolbarTitleSubject.next(title)
  }

  set digest (digest: number) {
    this.docDigestSubject.next(digest)
  }

  get onDocDigest (): Observable<number> {
    return this.docDigestSubject.asObservable()
  }

  set tree (tree: string) {
    this.docTreeSubject.next(tree)
  }

  get onDocTree (): Observable<string> {
    return this.docTreeSubject.asObservable()
  }

}
