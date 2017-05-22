import { NgModule } from '@angular/core'
import { Http } from '@angular/http'
import { CommonModule } from '@angular/common'

import { BotStorageService } from './storage/bot-storage/bot-storage.service'
import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { ProfileService } from './profile/profile.service'
import { FakeStorageService } from './storage/fake-storage/fake-storage.service'
import { UiService } from './ui/ui.service'
import { XirsysService } from './xirsys/xirsys.service'

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
    FakeStorageService,
    UiService,
    XirsysService
  ]
})
export class CoreModule {
  constructor () {
    log.angular('CoreModule constructed')
  }
}
