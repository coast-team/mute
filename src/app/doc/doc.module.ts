import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { CursorsDirective } from '../doc/editor/cursor/cursors.directive'
import { RightSideModule } from './right-side'
import { SharedModule } from '../shared'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { NetworkService } from './network/network.service'
import { DocResolverService } from './doc-resolver.service'
import { NavModule } from '../nav'

@NgModule({
  declarations: [
    DocComponent,
    EditorComponent,
    CursorsDirective
  ],
  imports: [
    SharedModule,
    NavModule,
    RightSideModule,
    RouterModule.forChild([
      {
        path: 'doc/:key',
        component: DocComponent,
        resolve: {
          doc: DocResolverService
        }
      }
    ])
  ],
  providers: [ NetworkService, DocResolverService ]
})
export class DocModule {
  constructor () {
    log.angular('DocModule constructed')
    /*
    docService.localTextOperationsSource = editorService.onLocalTextOperations
    docService.remoteLogootSOperationSource = syncService.onRemoteLogootSOperation
    docService.joinSource = networkService.onJoin

    syncService.joinSource = networkService.onJoin
    syncService.localLogootSOperationSource = docService.onLocalLogootSOperation
    syncService.remoteQuerySyncSource = syncMessageService.onRemoteQuerySync
    syncService.remoteReplySyncSource = syncMessageService.onRemoteReplySync
    syncService.remoteRichLogootSOperationSource = syncMessageService.onRemoteRichLogootSOperation
    syncService.storedStateSource = syncStorageService.onStoredState

    syncMessageService.localRichLogootSOperationSource = syncService.onLocalRichLogootSOperation
    syncMessageService.messageSource = networkService.onMessage
    syncMessageService.querySyncSource = syncService.onQuerySync
    syncMessageService.replySyncSource = syncService.onReplySync

    syncStorageService.joinSource = networkService.onJoin
    syncStorageService.stateSource = syncService.onState
    */
  }
}
