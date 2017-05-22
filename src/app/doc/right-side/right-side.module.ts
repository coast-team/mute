import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { RightSideComponent } from './right-side.component'
import { CollaboratorsModule } from './collaborators'
import { InviteBotComponent } from './invite-bot/invite-bot.component'
import { SharedModule } from '../../shared'

@NgModule({
  declarations: [
    RightSideComponent,
    InviteBotComponent
  ],
  imports: [
    SharedModule,
    CollaboratorsModule,
    RouterModule
  ],
  exports: [ RightSideComponent ],
  providers: [ ]
})
export class RightSideModule { }
