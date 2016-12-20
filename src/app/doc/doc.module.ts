import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MaterialModule } from '@angular/material'

import { DocService } from './doc.service'
import { DocComponent } from './doc.component'
import { EditorComponent } from './editor/editor.component'
import { EditorService } from './editor/editor.service'
import { RightsideComponent } from './rightside/rightside.component'
import { CollaboratorsComponent } from './rightside/collaborators/collaborators.component'
import { InviteBotComponent } from './rightside/invite-bot/invite-bot.component'


@NgModule({
  declarations: [
    RightsideComponent,
    DocComponent,
    CollaboratorsComponent,
    InviteBotComponent,
    EditorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    RouterModule.forChild([
      {path: 'doc/:key', component: DocComponent}
    ])
  ],
  providers: [ DocService, EditorService ]
})
export class DocModule { }
