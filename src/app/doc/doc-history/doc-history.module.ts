import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'

import { DocResolverService } from '../doc-resolver.service'
import { SharedModule } from '../../shared'
import { TimelineComponent } from './timeline/timeline.component'
import { DocHistoryComponent } from './doc-history.component'
import { CollaboratorsComponent } from './collaborators/collaborators.component'
import { HistoryControlsComponent } from './history-controls/history-controls.component'

@NgModule({
  declarations: [
    DocHistoryComponent,
    TimelineComponent,
    CollaboratorsComponent,
    HistoryControlsComponent
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
