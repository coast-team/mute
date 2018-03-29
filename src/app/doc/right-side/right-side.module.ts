import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../../shared/shared.module'
import { MarkdownCheatsheetComponent } from './cheatsheets/markdown-cheatsheet/markdown-cheatsheet.component'
import { DetailsComponent } from './details/details.component'
import { InviteBotComponent } from './invite-bot/invite-bot.component'
import { RightSideComponent } from './right-side.component'

@NgModule({
  declarations: [RightSideComponent, InviteBotComponent, MarkdownCheatsheetComponent, DetailsComponent],
  imports: [SharedModule, RouterModule],
  exports: [RightSideComponent],
  providers: [],
})
export class RightSideModule {}
