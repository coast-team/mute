import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { Ng2UiAuthModule } from 'ng2-ui-auth'

import { environment } from '../../environments/environment'
import { ProfileService } from './profile/profile.service'
import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { StorageService } from './storage/storage.service'
import { UiService } from './ui/ui.service'

// export class AuthConfig extends CustomConfig {

//   constructor () {
//     super()
//     if (environment.auth.baseUrl !== '') {
//       this.baseUrl = environment.auth.baseUrl
//       this.providers = environment.auth.providers
//     }
//     this.defaultHeaders = { 'Content-Type': 'application/json' }
//   }

// }

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    // Ng2UiAuthModule.forRoot(AuthConfig)
    Ng2UiAuthModule.forRoot(environment.auth)
  ],
  exports: [],
  declarations: [],
  providers: [
    ProfileService,
    StorageService,
    BotStorageService,
    UiService
  ]
})
export class CoreModule {
}
