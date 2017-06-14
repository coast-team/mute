import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { RightSideComponent } from './right-side.component'
import { CollaboratorsModule } from './collaborators'
import { InviteBotComponent } from './invite-bot/invite-bot.component'
import { SharedModule } from '../../shared'
import { HistoryToolsComponent } from './history-tools/history-tools.component'

@NgModule({
  declarations: [
    RightSideComponent,
    InviteBotComponent,
    HistoryToolsComponent
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
