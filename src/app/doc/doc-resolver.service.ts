import { Injectable } from '@angular/core'
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router'

import { StorageService } from '../core/storage/storage.service'
import { UiService } from '../core/ui/ui.service'
import { File } from '../core/File'
import { Doc } from '../core/Doc'

@Injectable()
export class DocResolverService implements Resolve<Doc> {

  constructor (
    private router: Router,
    private ui: UiService,
    private storage: StorageService
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Doc> {
    const key = route.params['key']
    const activeFile = this.ui.activeFile
    log.debug('Resolver ', activeFile)
    // If user come from another part of the application
    if (activeFile && activeFile.isDoc) {
      return Promise.resolve(activeFile)

    // If user come here directly via URL
    } else {
      return this.storage.searchDoc(key)
        .then((docs: Doc[]) => {
          // FIXME: it's possible here to fetch a Folder with provided key and thus need to treat this scenario
          if (docs.length !== 0) {
            // FIXME: maybe found several documents (in the future when folders are implemented)
            this.ui.setActiveFile(docs[0])
            log.debug('Set active file to ', this.ui.activeFile.title)
            return docs[0]
          } else {
            log.info(`Creating a new document identified by "${key}" key`)
            const doc = this.storage.createDoc(key)
            this.ui.setActiveFile(doc)
            return doc
          }
        })
        .catch((err) => {
          log.error('Failed to find a doc', err)
        })
    }
  }
}
