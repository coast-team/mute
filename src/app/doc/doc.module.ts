import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'


import { RightSideModule } from './right-side'
import { SharedModule } from 'shared'
import { DocService } from './doc.service'
import { DocComponent } from './doc.component'
import { NetworkService } from './network/network.service'
import { EditorComponent } from './editor/editor.component'
import { EditorService } from './editor/editor.service'

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
  providers: [ NetworkService, DocService, EditorService ]
})
export class DocModule {
  constructor (docService: DocService, editorService: EditorService, networkService: NetworkService) {
    log.angular('DocModule constructor')
    docService.localOperationsSource = editorService.onLocalOperations
    docService.joinSource = networkService.onJoin
    docService.messageSource = networkService.onMessage
  }
}
