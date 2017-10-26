import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router,
         RouterStateSnapshot } from '@angular/router'

import { Folder } from '../core/Folder'
import { StorageService } from '../core/storage/storage.service'
import { UiService } from '../core/ui/ui.service'

@Injectable()
export class DocsResolverService implements Resolve<Folder> {

  constructor (
    private router: Router,
    private ui: UiService,
    private storage: StorageService
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Folder> {
    if (state.url === '/') {
      this.ui.setActiveFile(this.storage.home)
      return Promise.resolve(this.storage.home)
    } else {
      return this.storage.searchFolder(state.url)
        .then((folder) => {
          this.ui.setActiveFile(folder)
          return folder
        })
        .catch(() => {
          this.router.navigate([''])
        })
    }
  }
}
