import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../storage'
import { Folder } from '../Folder'
import { File } from '../File'

@Injectable()
export class UiService {

  private activeFileSubject: BehaviorSubject<File | null>

  private navToggleSubject: BehaviorSubject<boolean>
  private docNavToggleSubject: BehaviorSubject<boolean>
  private toolbarTitleSubject: BehaviorSubject<string>

  public navOpened = false
  public docNavOpened = true
  public activeFile: File|null

  constructor () {
    this.activeFileSubject = new BehaviorSubject(null)
    this.navToggleSubject = new BehaviorSubject<boolean>(this.navOpened)
    this.docNavToggleSubject = new BehaviorSubject<boolean>(this.docNavOpened)
    this.toolbarTitleSubject = new BehaviorSubject<string>(this.toolbarTitle)
  }

  get onActiveFile (): Observable<File> {
    return this.activeFileSubject.asObservable()
  }

  setActiveFile (file: File) {
    this.activeFileSubject.next(file)
  }

  get onNavToggle (): Observable<boolean> {
    return this.navToggleSubject.asObservable()
  }

  openNav (): void {
    this.navOpened = true
    this.navToggleSubject.next(true)
  }

  closeNav (): void {
    this.navOpened = false
    this.navToggleSubject.next(false)
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

  get onToolbarTitle (): Observable<string> {
    return this.toolbarTitleSubject.asObservable()
  }

  set toolbarTitle (title) {
    this.toolbarTitleSubject.next(title)
  }

}
