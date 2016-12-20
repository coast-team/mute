import { NgModule } from '@angular/core'
import { Http } from '@angular/http'
import { CommonModule } from '@angular/common'

import { BotStorageService } from './bot-storage/bot-storage.service'
import { ProfileService } from './profile/profile.service'
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
    ProfileService,
    UiService
  ]
})
export class CoreModule { }
