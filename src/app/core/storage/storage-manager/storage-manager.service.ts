import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { LocalStorageService } from '../local-storage/local-storage.service'
import { BotStorageService } from '../bot-storage/bot-storage.service'
import { Folder } from 'core/storage/Folder'

@Injectable()
export class StorageManagerService {

  private activeFolderSubject: BehaviorSubject<Folder | null>

  public onRootFolders: Observable<Folder[]>

  constructor (localStorage: LocalStorageService, botStorage: BotStorageService) {
    this.activeFolderSubject = new BehaviorSubject(null)

    // Accumulate all root folders from local storages into one array
    const localFolders = localStorage.onFolders.reduce((acc: Array<Folder>, curr) => {
      acc.push(curr)
      return acc
    }, new Array<Folder>())

    // Accumulate all root folders from bot storages into one array
    const botFolders = botStorage.onFolders.reduce((acc: Array<Folder>, curr) => {
      acc.push(curr)
      return acc
    }, new Array<Folder>())

    // Combine both arrays together
    this.onRootFolders = Observable.combineLatest(localFolders, botFolders, (v1, v2) => v1.concat(v2))
  }

  setActiveFolder (folder: Folder) {
    this.activeFolderSubject.next(folder)
  }

  get onActiveFolder (): Observable<Folder> {
    return this.activeFolderSubject.asObservable()
  }
}
