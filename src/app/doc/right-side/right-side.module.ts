import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MaterialModule } from '@angular/material'

import { RightSideComponent } from './right-side.component'
import { CollaboratorsModule } from './collaborators'
import { InviteBotComponent } from './invite-bot/invite-bot.component'


@NgModule({
  declarations: [
    RightSideComponent,
    InviteBotComponent
  ],
  imports: [
    CommonModule,
    CollaboratorsModule,
    MaterialModule.forRoot()
  ],
  exports: [ RightSideComponent ],
  providers: [ ]
})
export class RightSideModule { }
