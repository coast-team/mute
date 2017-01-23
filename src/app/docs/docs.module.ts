import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SharedModule } from 'shared'
import { NavModule } from 'nav'
import { DocsComponent } from './docs.component'

@NgModule({
  declarations: [ DocsComponent ],
  imports: [
    CommonModule,
    SharedModule,
    NavModule,
    RouterModule.forChild([
      {path: '', component: DocsComponent}
    ])
  ],
  providers: []
})
export class DocsModule { }
