import { Injectable }             from '@angular/core'
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router'

import { LocalStorageService, BotStorageService } from './core/storage'
import { UiService } from './core/ui/ui.service'
import { File } from './core/File'
import { Doc } from './core/Doc'

@Injectable()
export class AppResolverService implements Resolve<void> {

  constructor (
    private router: Router,
    private ui: UiService,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<void> {
    const urlKey = route.params['key']
    console.log(urlKey)
    log.debug('ActivatedRouteSnapshot: ', route)
    return Promise.resolve()
    // if (activeFile && activeFile instanceof Doc && urlKey === activeFile.id) {
    //   log.debug('here')
    //   return this.localStorage.get(activeFile.id)
    //     .catch((err) => {
    //       activeFile.save()
    //       return activeFile
    //     })
    // } else {
    //   return this.localStorage.get(urlKey)
    //     .then((localDoc: Doc) => {
    //       this.ui.setActiveFile(localDoc)
    //       return localDoc
    //     })
    //     .catch((err) => {
    //       activeFile = this.localStorage.createDoc(urlKey)
    //       this.ui.setActiveFile(activeFile)
    //       return activeFile
    //     })
    // }
  }
}
