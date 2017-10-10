import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { NavModule } from '../../nav'
import { SharedModule } from '../../shared'
import { CollaboratorsComponent } from './collaborators/collaborators.component'
import { DocHistoryComponent } from './doc-history.component'
import { HistoryControlsComponent } from './history-controls/history-controls.component'
import { TimelineComponent } from './timeline/timeline.component'

@NgModule({
  declarations: [
    DocHistoryComponent,
    TimelineComponent,
    CollaboratorsComponent,
    HistoryControlsComponent
  ],
  imports: [
    SharedModule,
    NavModule,
    FormsModule
  ]
})
export class DocHistoryModule {}
