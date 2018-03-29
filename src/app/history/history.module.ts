import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { SharedModule } from '../shared/shared.module'
import { CollaboratorsComponent } from './collaborators/collaborators.component'
import { ControlsComponent } from './controls/controls.component'
import { HistoryResolverService } from './history-resolver.service'
import { HistoryComponent } from './history.component'
import { HistoryService } from './history.service'
import { TimelineComponent } from './timeline/timeline.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [SharedModule, FormsModule],
  declarations: [HistoryComponent, TimelineComponent, CollaboratorsComponent, ControlsComponent, ToolbarComponent],
  providers: [HistoryService, HistoryResolverService],
})
export class HistoryModule {}
