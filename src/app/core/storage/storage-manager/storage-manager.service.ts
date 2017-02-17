import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { LocalStorageService } from '../local-storage/local-storage.service'
import { BotStorageService } from '../bot-storage/bot-storage.service'
import { File } from 'core/storage/File'

@Injectable()
export class StorageManagerService extends AbstractStorageService {

  private activeFileSubject: BehaviorSubject<File | null>

  public rootFile: File

  constructor (
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService
  ) {
    super()
    this.activeFileSubject = new BehaviorSubject(null)
    this.rootFile = new File('', 'All documents', '', false, this)
  }

  getRootFiles (): Promise<File[]> {
    return Promise.all([
      this.localStorage.getRootFiles(),
      this.botStorage.getRootFiles()
    ])
      .then((allRootFiles) => {
        return allRootFiles[0].concat(allRootFiles[1])
      })
  }

  setActiveFile (folder: File) {
    this.activeFileSubject.next(folder)
  }

  get onActiveFile (): Observable<File> {
    return this.activeFileSubject.asObservable()
  }

  delete (file: File, name: string): Promise<void> {
    throw new Error('Not implemented')
  }

  deleteAll (file: File): Promise<void> {
    throw new Error('Not implemented')
  }

  getDocuments (file: File): Promise<Array<any>> {
    return Promise.resolve([])
  }

  getDocument (file: File, name: string) {
    throw new Error('Not implemented')
  }

  addDocument (file: File, name: string, doc: any) {
    throw new Error('Not implemented')
  }
}
