import { NgModule } from '@angular/core'

import { CursorsDirective } from '../doc/editor/cursor/cursors.directive'
import { RightSideModule } from './right-side'
import { SharedModule } from '../shared'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { NetworkService } from './network/network.service'
import { DocResolverService } from './doc-resolver.service'
import { NavModule } from '../nav'
import { DocHistoryModule } from './doc-history/doc-history.module'
import { StyleToolbarComponent } from './editor/style-toolbar/style-toolbar.component'

@NgModule({
  declarations: [
    DocComponent,
    EditorComponent,
    CursorsDirective,
    StyleToolbarComponent,
  ],
  imports: [
    SharedModule,
    NavModule,
    RightSideModule,
    DocHistoryModule
  ],
  providers: [ NetworkService, DocResolverService ]
})
export class DocModule {}
