import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router'

import { Folder } from '../core/Folder'
import { StorageService } from '../core/storage/storage.service'

@Injectable()
export class DocsResolverService implements Resolve<Folder> {

  constructor (
    private router: Router,
    private snackBar: MatSnackBar,
    private storage: StorageService
  ) {}

  async resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Folder> {
    const path = state.url.substr(5)
    try {
      if (path === '' || path === '/home') {
        return this.storage.home
      } else if (path === '/trash') {
        return this.storage.trash
      } else {
        throw new Error(`Unknown location: "${path}"`)
      }
    } catch (err) {
      log.warn(`Failed to locate "${path}" folder.`, err.message)
      this.snackBar.open(`Couldn't resolve the URL. Redirect to home.`, 'close', {duration: 4000})
      this.router.navigateByUrl('/docs', {skipLocationChange: false})
      return undefined
    }
  }
}
