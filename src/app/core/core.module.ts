import { NgModule } from '@angular/core'
import { Http } from '@angular/http'
import { CommonModule } from '@angular/common'

import { NetworkService } from './network/network.service'
import { BotStorageService } from './bot-storage/bot-storage.service'
import { ProfileService } from './profile/profile.service'
import { CollaboratorsService } from './collaborators/collaborators.service'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [],
  providers: [
    Http,
    NetworkService,
    BotStorageService,
    ProfileService,
    CollaboratorsService
  ]
})
export class CoreModule { }
