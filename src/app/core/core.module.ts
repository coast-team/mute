import { NgModule } from '@angular/core'
import { Http } from '@angular/http'
import { CommonModule } from '@angular/common'

import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { ProfileService } from './profile/profile.service'
import { StorageManagerService } from './storage/storage-manager/storage-manager.service'
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
