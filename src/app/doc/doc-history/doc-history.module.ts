import { NgModule } from '@angular/core'

import { TimelineComponent } from './timeline/timeline.component'
import { DocHistoryComponent } from './doc-history.component'

@NgModule({
  declarations: [
    DocHistoryComponent,
    TimelineComponent
  ],
  imports: []
})
export class DocHistoryModule {
  constructor () {
    log.angular('DocHistoryModule constructed')
  }
}
