import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MaterialModule } from '@angular/material'

import { DocsComponent } from './docs.component'

@NgModule({
  declarations: [ DocsComponent ],
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    RouterModule.forChild([
      {path: '', component: DocsComponent}
    ])
  ],
  providers: []
})
export class DocsModule { }
