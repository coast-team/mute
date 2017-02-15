import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { LocalStorageService } from '../local-storage/local-storage.service'
import { BotStorageService } from '../bot-storage/bot-storage.service'
import { Folder } from 'core/storage/Folder'

@Injectable()
export class StorageManagerService {

  private storageServices: AbstractStorageService[]
  private activeFolderSubject: BehaviorSubject<Folder | null>

  public folders: Observable<Folder[]>

  constructor (localStorage: LocalStorageService, botStorage: BotStorageService) {
    this.activeFolderSubject = new BehaviorSubject(null)
    this.storageServices = [localStorage, botStorage]
    this.folders = localStorage.folders
  }

  setActiveFolder (folder: Folder) {
    this.activeFolderSubject.next(folder)
  }

  get onActiveFolder (): Observable<Folder> {
    return this.activeFolderSubject.asObservable()
  }

}
