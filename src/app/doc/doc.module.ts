import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { CursorsDirective } from '../doc/editor/cursor/cursors.directive'
import { SharedModule } from '../shared/shared.module'
import { DevLabelComponent } from './dev-label/dev-label.component'
import { DocResolverService } from './doc-resolver.service'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { NetworkService } from './network/network.service'
import { ResolverDialogComponent } from './resolver-dialog/resolver-dialog.component'
import { RightSideModule } from './right-side'
import { SyncComponent } from './toolbar/sync/sync.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [SharedModule, RightSideModule, RouterModule],
  declarations: [
    DocComponent,
    EditorComponent,
    CursorsDirective,
    ToolbarComponent,
    SyncComponent,
    ResolverDialogComponent,
    DevLabelComponent,
  ],
  entryComponents: [ResolverDialogComponent],
  providers: [NetworkService, DocResolverService],
})
export class DocModule {}
