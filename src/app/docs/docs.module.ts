import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { SharedModule } from '../shared'
import { DocsComponent } from './docs.component'
import { NavModule } from '../nav'
import { RenameDocumentDialogComponent } from './docs.component'

@NgModule({
  declarations: [DocsComponent, RenameDocumentDialogComponent],
  imports: [
    CommonModule,
    SharedModule,
    NavModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  entryComponents: [RenameDocumentDialogComponent]
})
export class DocsModule {}
