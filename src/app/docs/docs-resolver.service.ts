import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router'

import { Folder } from '../core/Folder'
import { LocalStorageService } from '../core/storage/local-storage.service'

@Injectable()
export class DocsResolverService implements Resolve<Folder> {

  constructor (
    private router: Router,
    private snackBar: MatSnackBar,
    private storage: LocalStorageService
  ) {}

  async resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Folder> {
    const path = state.url.substr(5)
    try {
      if (path === '' || path === '/local') {
        return this.storage.local
      } else if (path === '/trash') {
        return this.storage.trash
      } else {
        throw new Error(`Unknown location: "${path}"`)
      }
    } catch (err) {
      log.warn(`Failed to locate "${path}" folder.`, err.message)
      this.snackBar.open(`Couldn't resolve the URL. Redirect to local.`, 'close', {duration: 4000})
      this.router.navigateByUrl('/docs', {skipLocationChange: false})
      return undefined
    }
  }
}
