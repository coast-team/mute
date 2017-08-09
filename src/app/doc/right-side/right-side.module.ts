import { NgModule, ViewChild, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'

import { RightSideComponent } from './right-side.component'
import { CollaboratorsModule } from './collaborators'
import { InviteBotComponent } from './invite-bot/invite-bot.component'
import { SharedModule } from '../../shared'
import { MarkdownCheatsheetComponent } from './cheatsheets/markdown-cheatsheet/markdown-cheatsheet.component'
import { MathJaxCheatsheetComponent } from './cheatsheets/mathjax-cheatsheet/mathjax-cheatsheet.component'

@NgModule({
  declarations: [
    RightSideComponent,
    InviteBotComponent,
    MarkdownCheatsheetComponent,
    MathJaxCheatsheetComponent
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
