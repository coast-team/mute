import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared'
import { NavComponent } from './nav.component'

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
