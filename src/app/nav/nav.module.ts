import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NavComponent } from './nav.component'
// import { AddStorageDialogComponent } from './add-storage-dialog/add-storage-dialog.component'
import { SharedModule } from '../shared'

@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  // entryComponents: [ AddStorageDialogComponent ],
  // declarations: [ NavComponent, AddStorageDialogComponent ],
  declarations: [ NavComponent ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
