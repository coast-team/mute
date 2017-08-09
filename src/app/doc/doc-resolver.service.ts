import { Injectable } from '@angular/core'
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router'

import { LocalStorageService } from '../core/storage/local-storage/local-storage.service'
import { UiService } from '../core/ui/ui.service'
import { File } from '../core/File'
import { Doc } from '../core/Doc'

@Injectable()
export class DocResolverService implements Resolve<Doc> {

  constructor (
    private router: Router,
    private ui: UiService,
    private localStorage: LocalStorageService
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Doc> {
    const urlKey = route.params['key']
    const activeFile = this.ui.activeFile as Doc

    // If user come from another part of the application
    if (activeFile && activeFile instanceof Doc && urlKey === activeFile.id) {
      return activeFile.isSaved()
        .then(() => activeFile)
        .catch((err) => {
          log.warn('Cannot find document ' + activeFile.id, err)
          activeFile.save()
          return activeFile
        })

    // If user come here directly via URL
    } else {
      return this.localStorage.get(urlKey)
        .then((doc: Doc) => {
          this.ui.setActiveFile(doc)
          return doc
        })
        .catch((err) => {
          log.warn(`${err.message}: createing a new document with ${urlKey} as key`)
          const doc = this.localStorage.createDoc(urlKey)
          this.ui.setActiveFile(doc)
          return doc
        })
    }
  }
}
