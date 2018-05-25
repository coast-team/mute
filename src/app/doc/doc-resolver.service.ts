import { Injectable } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ActivatedRouteSnapshot, CanDeactivate, Resolve, Router } from '@angular/router'

import { SymmetricCryptoService } from '../core/crypto/symmetric-crypto.service'
import { Doc } from '../core/Doc'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { DocComponent } from './index'
import { ResolverDialogComponent } from './resolver-dialog/resolver-dialog.component'

@Injectable()
export class DocResolverService implements Resolve<Doc>, CanDeactivate<DocComponent> {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    private symCrypto: SymmetricCryptoService
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<Doc> {
    const key = route.params['key']
    const remote = route.paramMap.get('remote')
    this.symCrypto.importKey(key)

    try {
      // Retreive the document from the local database
      let doc = await this.localStorage.lookupDoc(key).then((docs: Doc[]) => {
        if (docs && docs.length === 1) {
          return docs[0]
        } else if (docs.length > 1) {
          log.error('Faild to fetch doc: more then one doc exist with this key: ', key)
        }
      })

      if (doc) {
        if (doc.parentFolderId === this.localStorage.trash.id) {
          // Whether to restore the document from the trash
          const isDocReconstituted = await new Promise((resolve) => {
            const dialogRef = this.dialog.open(ResolverDialogComponent, { data: doc })
            dialogRef.afterClosed().subscribe((result) => resolve(result))
          })
          if (isDocReconstituted) {
            await this.localStorage.move(doc, this.localStorage.local)
          } else {
            this.router.navigateByUrl('', { skipLocationChange: false })
            return
          }
        }

        // Update opened date
        doc.opened = new Date()
        this.localStorage.save(doc)
        return doc
      } else {
        // Create a new document
        doc = await this.localStorage.createDoc(key)
        doc.opened = new Date()
        if (remote) {
          doc.addRemote(this.botStorage.id)
        }
        this.localStorage.save(doc)
        this.snackBar.open(`A new document has been created`, 'close', { duration: 3000 })
        return doc
      }
    } catch (err) {
      this.snackBar.open(`Could not open or create a document: ${err.message}`, 'close', { duration: 3000 })
      this.router.navigateByUrl('', { skipLocationChange: false })
      return undefined
    }
  }

  async canDeactivate(docComponent: DocComponent): Promise<boolean> {
    const doc = docComponent.doc
    if (doc) {
      await this.localStorage.saveDocBody(doc, docComponent.getDocState())
    }
    return true
  }
}
