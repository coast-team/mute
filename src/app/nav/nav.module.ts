import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { NavComponent } from './nav.component'
import { SharedModule } from '../shared'

@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  declarations: [ NavComponent ],
  exports: [
    NavComponent
  ]
})
export class NavModule { }
