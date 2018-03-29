import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { SharedModule } from '../shared/shared.module'
import { DocsComponent } from './docs.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
  declarations: [ToolbarComponent, DocsComponent],
  entryComponents: [],
})
export class DocsModule {}
