import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'

import { AbstractStorageService } from './AbstractStorageService'
import { LocalStorageService } from './local-storage/local-storage.service'
import { BotStorageService } from './bot-storage/bot-storage.service'
import { File } from './File'
import { Folder } from './Folder'

@Injectable()
export class StorageService extends AbstractStorageService {

  public allDocs: Folder

  constructor (
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService
  ) {
    super()
    this.allDocs = new Folder('', 'All documents', null, this)
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

  delete (file: File): Promise<void> {
    throw new Error('Not implemented')
  }

  deleteAll (folder: Folder): Promise<void> {
    throw new Error('Not implemented')
  }

  getFiles (folder: Folder): Promise<File[]> {
    // FIXME: refactor this. Too complex
    const allFiles = new Array<File>()
    return new Promise((resolve, reject) => {
      this.getRootFolders()
        .then((folders) => {

          const promises = new Array<Promise<void>>()
          folders.forEach((folder) => {
            promises.push(
              folder.getFiles()
                .then((files) => {
                  log.debug('ALL FILES: ', files)
                  files.forEach((f) => {
                    if (allFiles.every((file) => file.id !== f.id)) {
                      log.debug('Adding file :', f)
                      allFiles.push(f)
                    }
                  })
                })
            )
            Promise.all(promises).then(() => resolve(allFiles))
          })

        })
    })
  }

  addFile (folder: Folder, file: File): Promise<void> {
    throw new Error('Not implemented')
  }
}
