import { Injectable } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ActivatedRouteSnapshot, CanDeactivate, Resolve, Router } from '@angular/router'

import { environment } from '../../environments/environment'
import { CryptoService } from '../core/crypto/crypto.service'
import { Doc } from '../core/Doc'
import { SettingsService } from '../core/settings/settings.service'
import { BotStorageService } from '../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { DocComponent } from './doc.component'
import { DocService } from './doc.service'
import { ResolverDialogComponent } from './resolver-dialog/resolver-dialog.component'

@Injectable()
export class DocResolverService implements Resolve<Doc>, CanDeactivate<DocComponent> {
  private create: boolean
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    private settings: SettingsService,
    private crypto: CryptoService
  ) {
    this.create = null
  }

  async resolve(route: ActivatedRouteSnapshot): Promise<Doc> {
    const key = route.params['key']
    const remote = route.paramMap.get('remote')

    try {
      // Vefify my signging key pair to sign outcoming messages for key agreement cry`pto cycles
      if (environment.cryptography.coniksClient) {
        await this.crypto.checkMySigningKeyPairConiks(this.settings.profile)
      } else if (environment.cryptography.keyserver) {
        await this.crypto.checkMySigningKeyPair(this.settings.profile)
      }
      // Retreive the document from the local database
      let doc = await this.localStorage.fetchDoc(key)
      if (doc) {
        this.create = false
        if (doc.parentFolderId === this.localStorage.trash.id) {
          // Whether to restore the document from the trash
          const isDocReconstituted = await new Promise((resolve) => {
            const dialogRef = this.dialog.open(ResolverDialogComponent, { data: doc })
            dialogRef.afterClosed().subscribe((result) => resolve(result))
          })
          if (isDocReconstituted) {
            await doc.move(this.localStorage.local)
          } else {
            this.router.navigateByUrl('', { skipLocationChange: false })
            return
          }
        }
      } else {
        // Create a new document
        this.create = true
        doc = await this.localStorage.createDoc(key)
        if (remote) {
          doc.addRemote(this.botStorage.id)
        }
        this.snackBar.open(`A new document has been created`, 'close', { duration: 3000 })
      }

      doc.opened = new Date()
      return doc
    } catch (err) {
      this.snackBar.open(`Couldn't open a document. ${err.message}`, 'close', { duration: 5000 })
      this.router.navigateByUrl('', { skipLocationChange: false })
      return undefined
    }
  }

  async canDeactivate(docComponent: DocComponent): Promise<boolean> {
    await docComponent.saveDoc()
    return true
  }

  get isCreate(): boolean {
    return this.create
  }
}
