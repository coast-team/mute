import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { Ng2UiAuthModule } from 'ng2-ui-auth'

import { CustomConfig } from 'ng2-ui-auth'
import { environment } from '../../environments/environment'
import { ProfileService } from './profile/profile.service'
import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { StorageService } from './storage/storage.service'
import { UiService } from './ui/ui.service'

export class AuthConfig extends CustomConfig {

  constructor () {
    super()
    this.baseUrl = environment.auth.baseUrl
    this.providers = environment.auth.providers
    this.defaultHeaders = { 'Content-Type': 'application/json' }
  }

}

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    Ng2UiAuthModule.forRoot(AuthConfig)
  ],
  exports: [],
  declarations: [],
  providers: [
    StorageService,
    BotStorageService,
    ProfileService,
    UiService
  ]
})
export class CoreModule {}
