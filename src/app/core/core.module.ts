import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { Ng2UiAuthModule } from 'ng2-ui-auth'

import { environment } from '../../environments/environment'
import { SymmetricCryptoService } from './crypto/symmetric-crypto.service'
import { SettingsService } from './settings/settings.service'
import { BotStorageService } from './storage/bot/bot-storage.service'
import { LocalStorageService } from './storage/local/local-storage.service'
import { StorageService } from './storage/storage.service'
import { UiService } from './ui/ui.service'

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    Ng2UiAuthModule.forRoot(environment.auth)
  ],
  exports: [],
  declarations: [],
  providers: [
    SettingsService,
    LocalStorageService,
    BotStorageService,
    StorageService,
    UiService,
    SymmetricCryptoService
  ]
})
export class CoreModule {
}
