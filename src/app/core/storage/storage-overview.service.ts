import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { AbstractStorageService } from './AbstractStorageService'
import { LocalStorageService } from './local-storage/local-storage.service'
import { BotStorageService } from './bot-storage/bot-storage.service'
import { File } from '../File'
import { Folder } from '../Folder'
import { Doc } from '../Doc'

@Injectable()
export class StorageOverviewService extends AbstractStorageService {

  public allDocs: Folder

  constructor (
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService
  ) {
    super()
    this.allDocs = new Folder('all', 'All documents', '', this, 'view_module')
  }

  getRootFolders (): Promise<Folder[]> {
    return Promise.all([
      this.localStorage.getRootFolders(),
      this.botStorage.getRootFolders()
    ])
      .then((allRootFoflders) => {
        return allRootFoflders[0].concat(allRootFoflders[1])
      })
  }

  getFiles (folder: Folder): Promise<File[]> {
    // TODO: find a better implementation for this function
    let localFiles = null
    return this.localStorage.home.getFiles()
      .then((files) => {
        localFiles = files
        return this.botStorage.getRootFolders()
      })
      .then((botFolders: Folder[]) => {
        // FIXME: run trough all bot root folders. For now the first bot storage root folder is used by default
        if (botFolders.length !== 0) {
          return botFolders[0].getFiles()
        }
        return []
      })
      .then((botFiles) => {
        const files: File[] = []
        localFiles.forEach((f1: File) => {
          files.push(f1)
          botFiles.forEach((f2: File) => {
            if (f1.id === f2.id) {
              this.merge(f1 as Doc, f2 as Doc)
            } else {
              files.push(f2)
            }
          })
        })
        botFiles.forEach((f2: File) => {
          let found = false
          files.forEach((f) => {
            if (f2.id === f.id) {
              found = true
            }
          })
          if (!found) {
            files.push(f2)
          }
        })
        return files
      })
  }

  private merge (doc1: Doc, doc2: Doc) {
    doc2.botIds.forEach((botId2) => {
      let found = false
      doc1.botIds.forEach((botId1) => {
        if (botId2 === botId1) {
          found = true
        }
      })
      if (!found) {
        doc1.addBotId(botId2)
      }
    })
  }
}
