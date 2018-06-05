import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { DocResolverService } from './doc-resolver.service'
import { DocComponent } from './doc.component'
import { CursorsDirective } from './editor/cursor/cursors.directive'
import { EditorComponent } from './editor/editor.component'
import { ResolverDialogComponent } from './resolver-dialog/resolver-dialog.component'
import { RightSideModule } from './right-side'
import { SyncComponent } from './toolbar/sync/sync.component'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [SharedModule, RightSideModule, RouterModule],
  declarations: [DocComponent, EditorComponent, CursorsDirective, ToolbarComponent, SyncComponent, ResolverDialogComponent],
  entryComponents: [ResolverDialogComponent],
  providers: [DocResolverService],
})
export class DocModule {}
