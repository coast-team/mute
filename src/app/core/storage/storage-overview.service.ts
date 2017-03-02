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
    this.allDocs = new Folder('all', 'All documents', null, this, 'view_module')
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
    log.warn('Could not delete a file from "All documents" folder. This feature is not implemented yet.', file)
    throw new Error('Could not delete a file from "All documents" folder')
  }

  deleteAll (folder: Folder): Promise<void> {
    log.warn('Could not delete all files from "All documents" folder. This feature is not implemented yet.', folder)
    throw new Error('Could not delete all files from "All documents" folder')
  }

  getFiles (folder: Folder): Promise<File[]> {
    // TODO: find a better implementation for this function
    return this.localStorage.home.getFiles()
      .then((localFiles) => this.botStorage.getRootFolders()
        .then((botFolders) => botFolders[0].getFiles()
          .then((botFiles) => {
            const files = new Array<File>()
            localFiles.forEach((f1: File) => {
              botFiles.forEach((f2: File) => {
                if (f1.id === f2.id) {
                  if (f1.isDoc() && f2.isDoc()) {
                    this.merge(f1 as Doc, f2 as Doc)
                  }
                  files.push(f1)
                } else {
                  files.push(f1)
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
        )
      )
  }

  addFile (folder: Folder, file: File): Promise<void> {
    log.warn('Could not add a file to "All documents" folder. This feature is not implemented yet.', file)
    throw new Error('Could not add a file to "All documents" folder')
  }

  private merge (doc1: Doc, doc2: Doc) {
    doc2.storages.forEach((s) => {
      if (!doc1.storages.includes(s)) {
        doc1.addStorage(s)
      }
    })
    doc2.botContacts.forEach((bc2) => {
      let found = false
      doc1.botContacts.forEach((bc1) => {
        if (bc2.apiURL === bc1.apiURL || bc2.p2pURL === bc1.p2pURL) {
          found = true
        }
      })
      if (!found) {
        doc1.addBotContact(bc2)
      }
    })
  }
}
