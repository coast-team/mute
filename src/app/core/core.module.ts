import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { CommonModule } from '@angular/common'

import { StorageService } from './storage/storage.service'
import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { ProfileService } from './profile/profile.service'
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
    StorageService,
    BotStorageService,
    ProfileService,
    UiService,
    WindowRefService
  ]
})
export class CoreModule {}
