import { Injectable } from '@angular/core'
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router'

import { StorageService } from '../core/storage/storage.service'
import { UiService } from '../core/ui/ui.service'
import { File } from '../core/File'
import { Folder } from '../core/Folder'

@Injectable()
export class DocsResolverService implements Resolve<Folder> {

  constructor (
    private router: Router,
    private ui: UiService,
    private storage: StorageService
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Folder> {
    const activeFile = this.ui.activeFile

    if (state.url === '/') {
      this.ui.setActiveFile(this.storage.home)
      return Promise.resolve(this.storage.home)
    } else {
      return this.storage.searchFolder(state.url)
        .catch(() => {
          this.router.navigate([''])
        })
    }
  }
}
