import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { StorageServiceInterface } from '../StorageServiceInterface'
import { LocalStorageService } from '../local-storage/local-storage.service'
import { BotStorageService, BotTuple } from '../bot-storage/bot-storage.service'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { Doc } from '../../Doc'

@Injectable()
export class FakeStorageService implements StorageServiceInterface {

  public allDocs: Folder

  constructor (
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService
  ) {
    this.allDocs = new Folder('all', 'All documents', 'view_module', this)
  }

  fetchFiles (folder: Folder): Promise<File[]> {
    // TODO: find a better implementation for this function
    return new Promise((resolve, reject) => {
      let resultDocs: Doc[] = []
      this.localStorage.home.fetchFiles()
        .then((localDocs: Doc[]) => {
          resultDocs = resultDocs.concat(localDocs)

          // Fetch docs from bot
          this.botStorage.onBots
            .subscribe((bots: BotTuple[]) => {
              // FIXME: now uses only the first bot in the array
              if (bots.length !== 0) {
                const botFolder = bots[0][1]
                botFolder.fetchFiles()
                  .then((botDocs: Doc[]) => {
                    if (resultDocs.length === 0) {
                      resultDocs = resultDocs.concat(botDocs)
                    } else {
                      resultDocs.forEach((doc: Doc) => {
                        for (let i = 0; i < botDocs.length; i++) {
                          if (doc.id === botDocs[i].id) {
                            doc.bot = botDocs[i].bot
                            doc.botFolder = botDocs[i].botFolder
                            botDocs.splice(i, 1)
                            break
                          }
                        }
                      })
                      resultDocs = resultDocs.concat(botDocs)
                    }
                    resolve(resultDocs)
                  })
              } else {
                resolve(resultDocs)
              }
            })
        })
    })
  }

  deleteFiles (folder: Folder): Promise<any> {
    return Promise.reject('It is not possible to do it here')
  }
}
