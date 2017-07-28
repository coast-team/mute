import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { RightSideComponent } from './right-side.component'
import { CollaboratorsModule } from './collaborators'
import { InviteBotComponent } from './invite-bot/invite-bot.component'
import { SharedModule } from '../../shared'
import { MarkdownCheatsheetComponent } from './cheatsheets/markdown-cheatsheet.component'

@NgModule({
  declarations: [
    RightSideComponent,
    InviteBotComponent,
    MarkdownCheatsheetComponent
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
