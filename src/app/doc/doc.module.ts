import { NgModule } from '@angular/core'

import { CursorsDirective } from '../doc/editor/cursor/cursors.directive'
import { NavModule } from '../nav'
import { SharedModule } from '../shared'
import { DocHistoryModule } from './doc-history/doc-history.module'
import { DocResolverService } from './doc-resolver.service'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { StyleToolbarComponent } from './editor/style-toolbar/style-toolbar.component'
import { NetworkService } from './network/network.service'
import { RightSideModule } from './right-side'

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
