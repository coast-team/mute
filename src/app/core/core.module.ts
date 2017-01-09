import { NgModule } from '@angular/core'
import { Http } from '@angular/http'
import { CommonModule } from '@angular/common'

import { BotStorageService } from './bot-storage/bot-storage.service'
import { LocalStorageService } from './local-storage/local-storage.service'
import { ProfileService } from './profile/profile.service'
import { StorageManagerService } from './storage-manager/storage-manager.service'
import { UiService } from './ui/ui.service'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [],
  providers: [
    Http,
    BotStorageService,
    LocalStorageService,
    ProfileService,
    StorageManagerService,
    UiService
  ]
})
export class CoreModule { }
