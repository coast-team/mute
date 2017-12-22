import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { SharedModule } from '../shared/shared.module'
import { RenameDocDialogComponent } from './dialogs/rename-doc-dialog.component'
import { DocsResolverService } from './docs-resolver.service'
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
  providers: [DocsResolverService],
  entryComponents: [RenameDocDialogComponent]
})
export class DocsModule {}
