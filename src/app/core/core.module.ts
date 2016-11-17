import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { NetworkService } from './network/network.service'
import { ProfileService } from './profile/profile.service'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [],
  providers: [NetworkService, ProfileService]
})
export class CoreModule { }
