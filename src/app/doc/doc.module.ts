import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

import { CursorsDirective } from 'doc/editor/cursor/cursors.directive'
import { RightSideModule } from './right-side'
import { SharedModule } from 'shared'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { NetworkService } from './network/network.service'

@NgModule({
  declarations: [
    DocComponent,
    EditorComponent,
    CursorsDirective
  ],
  imports: [
    SharedModule,
    RightSideModule,
    RouterModule.forChild([
      {path: 'doc/:key', component: DocComponent}
    ])
  ],
  providers: [ NetworkService ]
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
