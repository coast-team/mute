import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { NetworkService } from './network/network.service'
import { ProfileService } from './profile/profile.service'
import { CollaboratorsService } from './collaborators/collaborators.service'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [],
  providers: [NetworkService, ProfileService, CollaboratorsService]
})
export class CoreModule { }
