import { Injectable }             from '@angular/core'
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
    log.angular('Doc-Resolver.service')
    const urlKey = route.params['key']
    let activeFile = this.ui.activeFile as Doc
    if (activeFile && activeFile instanceof Doc && urlKey === activeFile.id) {
      return this.localStorage.get(activeFile.id)
        .catch((err) => {
          activeFile.save()
          return activeFile
        })
    } else {
      return this.localStorage.get(urlKey)
        .then((localDoc: Doc) => {
          this.ui.setActiveFile(localDoc)
          return localDoc
        })
        .catch((err) => {
          activeFile = this.localStorage.createDoc(urlKey)
          this.ui.setActiveFile(activeFile)
          return activeFile
        })
    }
  }
}
