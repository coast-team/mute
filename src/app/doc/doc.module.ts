import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MaterialModule } from '@angular/material'

import { NetworkService } from './network/network.service'
import { DocService } from './doc.service'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { EditorService } from './editor/editor.service'
import { RightSideModule } from './right-side'


@NgModule({
  declarations: [
    DocComponent,
    EditorComponent
  ],
  imports: [
    CommonModule,
    RightSideModule,
    MaterialModule.forRoot(),
    RouterModule.forChild([
      {path: 'doc/:key', component: DocComponent}
    ])
  ],
  providers: [ NetworkService, DocService, EditorService ]
})
export class DocModule { }
