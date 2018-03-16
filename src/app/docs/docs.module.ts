import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { SharedModule } from '../shared/shared.module'
import { RenameDocDialogComponent } from './dialogs/rename-doc-dialog.component'
import { DocsComponent } from './docs.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    RenameDocDialogComponent,
    ToolbarComponent,
    DocsComponent,
  ],
  entryComponents: [RenameDocDialogComponent]
})
export class DocsModule {}
