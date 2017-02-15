import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SharedModule } from 'shared'
import { DocsComponent } from './docs.component'

@NgModule({
  declarations: [ DocsComponent ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {path: '', redirectTo: 'local', pathMatch: 'full'},
      {path: ':storage', component: DocsComponent}
    ])
  ],
  providers: []
})
export class DocsModule {

  constructor () {
    log.angular('DocsModule constructed')
  }
}
