import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'

import { ProfileService } from './profile/profile.service'
import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { StorageService } from './storage/storage.service'
import { UiService } from './ui/ui.service'
import { WindowRefService } from './WindowRefService'

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
