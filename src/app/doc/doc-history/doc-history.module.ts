import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'

import { DocResolverService } from '../doc-resolver.service'
import { SharedModule } from '../../shared'
import { TimelineComponent } from './timeline/timeline.component'
import { DocHistoryComponent } from './doc-history.component'
import { CollaboratorsComponent } from './collaborators/collaborators.component'

@NgModule({
  declarations: [
    DocHistoryComponent,
    TimelineComponent,
    CollaboratorsComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: 'doc/history/:key',
        component: DocHistoryComponent,
        resolve: {
          doc: DocResolverService
        }
      }
    ])
  ]
})
export class DocHistoryModule {
  constructor () {
    log.angular('DocHistoryModule constructed')
  }
}
