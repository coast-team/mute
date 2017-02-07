import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'


import { RightSideModule } from './right-side'
import { SharedModule } from 'shared'
import { DocService } from './doc.service'
import { DocComponent } from './doc.component'
import { NetworkService } from './network/network.service'
import { EditorComponent } from './editor/editor.component'
import { EditorService } from './editor/editor.service'
import { SyncService } from './sync/sync.service'
import { SyncMessageService } from './sync/sync-message.service'
import { SyncStorageService } from './sync/sync-storage.service'

@NgModule({
  declarations: [
    DocComponent,
    EditorComponent
  ],
  imports: [
    SharedModule,
    RightSideModule,
    RouterModule.forChild([
      {path: 'doc/:key', component: DocComponent}
    ])
  ],
  providers: [
    DocService,
    EditorService,
    NetworkService,
    SyncMessageService,
    SyncService,
    SyncStorageService
  ]
})
export class DocModule {
  constructor (
    docService: DocService,
    editorService: EditorService,
    networkService: NetworkService,
    syncMessageService: SyncMessageService,
    syncService: SyncService,
    syncStorageService: SyncStorageService
  ) {
    log.angular('DocModule constructed')

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
  }
}
