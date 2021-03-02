import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { DocsComponent } from './docs.component'
import { ToolbarComponent } from './toolbar'

@NgModule({
  imports: [SharedModule],
  declarations: [ToolbarComponent, DocsComponent],
})
export class DocsModule {}
