import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NavComponent } from './nav.component'
import { StorageComponent } from './storage/storage.component'
import { SharedModule } from 'shared'

@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  declarations: [ NavComponent, StorageComponent ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
