import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { CommonModule } from '@angular/common'

import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { ProfileService } from './profile/profile.service'
import { FakeStorageService } from './storage/fake-storage/fake-storage.service'
import { WindowRefService } from './WindowRefService'
import { UiService } from './ui/ui.service'

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  exports: [],
  declarations: [],
  providers: [
    BotStorageService,
    LocalStorageService,
    ProfileService,
    FakeStorageService,
    UiService,
    WindowRefService
  ]
})
export class CoreModule {}
