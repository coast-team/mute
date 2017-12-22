import { NgModule } from '@angular/core'

import { CursorsDirective } from '../doc/editor/cursor/cursors.directive'
import { SharedModule } from '../shared/shared.module'
import { DocResolverService } from './doc-resolver.service'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { StyleToolbarComponent } from './editor/style-toolbar/style-toolbar.component'
import { NetworkService } from './network/network.service'
import { RightSideModule } from './right-side'
import { SyncComponent } from './toolbar/sync/sync.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [
    SharedModule,
    RightSideModule
  ],
  declarations: [
    DocComponent,
    EditorComponent,
    CursorsDirective,
    StyleToolbarComponent,
    ToolbarComponent,
    SyncComponent
  ],
  providers: [ NetworkService, DocResolverService ]
})
export class DocModule {}
