import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../../shared/shared.module'
import { MarkdownCheatsheetComponent } from './cheatsheets/markdown-cheatsheet/markdown-cheatsheet.component'
import { DetailsComponent } from './details/details.component'
import { RightSideComponent } from './right-side.component'

@NgModule({
  declarations: [RightSideComponent, MarkdownCheatsheetComponent, DetailsComponent],
  imports: [SharedModule, RouterModule],
  exports: [RightSideComponent],
})
export class RightSideModule {}
