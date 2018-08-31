import { NgModule } from '@angular/core'

import { SharedModule } from '../shared/shared.module'
import { DocsComponent } from './docs.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [SharedModule],
  declarations: [ToolbarComponent, DocsComponent],
  entryComponents: [],
})
export class DocsModule {}
