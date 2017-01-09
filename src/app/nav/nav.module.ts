import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MaterialModule } from '@angular/material'
import { RouterModule } from '@angular/router'

import { NavComponent } from './nav.component'
import { StorageComponent } from './storage/storage.component'

@NgModule({
  declarations: [ NavComponent, StorageComponent ],
  exports: [
    NavComponent
  ],
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    RouterModule
  ],
  providers: []
})
export class NavModule { }
