import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MaterialModule } from '@angular/material'

import { EditorComponent } from 'editor/editor.component'
import { RightsideComponent } from 'doc/rightside'
import { CollaboratorsComponent } from 'doc/rightside/collaborators'
import { InviteBotComponent } from 'doc/rightside/invite-bot'
import { DocComponent } from './doc.component'
import { DocService } from './doc.service'


@NgModule({
  declarations: [
    EditorComponent,
    RightsideComponent,
    DocComponent,
    CollaboratorsComponent,
    InviteBotComponent
  ],
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    RouterModule.forChild([
      {path: 'doc/:key', component: DocComponent}
    ])
  ],
  providers: [ DocService ]
})
export class DocModule { }
