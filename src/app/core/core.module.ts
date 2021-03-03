import { CommonModule } from '@angular/common'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { JwtInterceptor, Ng2UiAuthModule } from 'np2-ui-auth'

import { environment } from '@environments/environment'

import { CryptoService } from './crypto'
import { SettingsService } from './settings'
import { UiService } from './ui'
import {
  BotStorageService,
  LocalStorageService
} from './storage'

@NgModule({
  imports: [CommonModule, HttpClientModule, Ng2UiAuthModule.forRoot(environment.authentication)],
  exports: [],
  declarations: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    SettingsService,
    LocalStorageService,
    BotStorageService,
    UiService,
    CryptoService,
  ],
})
export class CoreModule {}
