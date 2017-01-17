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
    SyncService
  ]
})
export class DocModule {
  constructor (
    docService: DocService,
    editorService: EditorService,
    networkService: NetworkService,
    syncMessageService: SyncMessageService,
    syncService: SyncService) {
    log.angular('DocModule constructor')
    docService.localTextOperationsSource = editorService.onLocalTextOperations
    docService.remoteLogootSOperationSource = syncService.onRemoteLogootSOperation
    docService.joinSource = networkService.onJoin
    docService.messageSource = networkService.onMessage

    syncService.localLogootSOperationSource = docService.onLocalLogootSOperation
    syncService.remoteRichLogootSOperationSource = syncMessageService.onRemoteRichLogootSOperation

    syncMessageService.localRichLogootSOperationSource = syncService.onLocalRichLogootSOperation
    syncMessageService.messageSource = networkService.onMessage
  }
}
