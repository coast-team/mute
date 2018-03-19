import { Injectable } from '@angular/core'
import { State } from 'mute-core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { Observable } from 'rxjs/Observable'

import { Doc } from '../Doc'
import { Folder } from '../Folder'
import { BotStorageService } from './bot/bot-storage.service'
import { IStorage } from './IStorage'
import { LocalStorageService } from './local/local-storage.service'

export enum StorageStatus {
  AVAILABLE
}

@Injectable()
export class StorageService implements IStorage {

  public all: Folder
  public status

  private statusSubject: AsyncSubject<StorageStatus>
  private localStorage: LocalStorageService
  private botStorage: BotStorageService

  constructor () {
    this.all = new Folder('all', 'All documents', 'view_module')
    this.status = StorageStatus.AVAILABLE
    this.statusSubject = new AsyncSubject()
    this.statusSubject.next(StorageStatus.AVAILABLE)
  }

  get onStatusChange (): Observable<StorageStatus> {
    return this.statusSubject.asObservable()
  }

  init (localStorage: LocalStorageService, botStorage: BotStorageService) {
    this.localStorage = localStorage
    this.botStorage = botStorage
  }

  async getDocs (folder: Folder): Promise<Doc[]> {
    switch (folder) {
    case this.all:
      const localDocs = await this.localStorage.getDocs(this.localStorage.local)
      const remoteDocs = await this.botStorage.getDocs(this.botStorage.remote)
      if (localDocs.length === 0) {
        return remoteDocs
      } else if (remoteDocs.length === 0) {
        return localDocs
      } else {
        const allDocs = []
        localDocs.forEach((lDoc) => {
          remoteDocs.forEach((rDoc) => {
            if (lDoc.key === rDoc.key) {
              lDoc.setBotStorage([this.botStorage.bot])
              allDocs.push(lDoc)
            } else {
              allDocs.push(rDoc)
            }
          })
        })
        return allDocs
      }
    case this.localStorage.local:
      return this.localStorage.getDocs(folder)
    case this.localStorage.trash:
      return this.localStorage.getDocs(folder)
    case this.botStorage.remote:
      return this.botStorage.getDocs(folder)
    default:
      return []
    }
  }

  findFolder (key: string): Folder | undefined {
    switch (key) {
    case this.all.key:
      return this.all
    case this.localStorage.local.key:
      return this.localStorage.local
    case this.localStorage.trash.key:
      return this.localStorage.trash
    case this.botStorage.remote.key:
      return this.botStorage.remote
    default:
      return this.localStorage.local
    }
  }
}
