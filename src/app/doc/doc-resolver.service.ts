import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router'

import { Doc } from '../core/Doc'
import { LocalStorageService } from '../core/storage/local-storage.service'

@Injectable()
export class DocResolverService implements Resolve<Doc> {

  constructor (
    private router: Router,
    private snackBar: MatSnackBar,
    private storage: LocalStorageService
  ) {}

  async resolve (route: ActivatedRouteSnapshot): Promise<Doc> {
    const key = route.params['key']

    try {
      // If user come here directly via URL
      return this.storage.searchDoc(key)
        .then((docs: Doc[]) => {
          // FIXME: it's possible here to fetch a Folder with provided key and thus need to treat this scenario
          if (docs.length !== 0) {
            // FIXME: maybe found several documents (in the future when folders are implemented)
            return docs[0]
          } else {
            log.info(`Creating a new document identified by "${key}" key`)
            this.snackBar.open(`New document "${key}" has been created`, 'close', {duration: 3000})
            return this.storage.createDoc(key)
          }
        })
    } catch (err) {
      log.warn(`Failed to open document.`, err.message)
      this.snackBar.open(`Could not open or create a document: ${err.message}`, 'close', {duration: 3000})
      this.router.navigateByUrl('/docs', {skipLocationChange: false})
      return undefined
    }
  }
}
