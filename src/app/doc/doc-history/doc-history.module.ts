import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { SharedModule } from '../../shared'
import { TimelineComponent } from './timeline/timeline.component'
import { DocHistoryComponent } from './doc-history.component'
import { CollaboratorsComponent } from './collaborators/collaborators.component'
import { HistoryControlsComponent } from './history-controls/history-controls.component'
import { NavModule } from '../../nav'

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
