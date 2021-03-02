import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { SharedModule } from '../shared/shared.module'

import { CollaboratorsComponent } from './collaborators'
import { ControlsComponent } from './controls'
import { HistoryResolverService } from './history-resolver.service'
import { HistoryComponent } from './history.component'
import { HistoryService } from './history.service'
import { TimelineComponent } from './timeline'
import { ToolbarComponent } from './toolbar'

@NgModule({
  imports: [SharedModule, FormsModule],
  declarations: [HistoryComponent, TimelineComponent, CollaboratorsComponent, ControlsComponent, ToolbarComponent],
  providers: [HistoryService, HistoryResolverService],
})
export class HistoryModule {}
