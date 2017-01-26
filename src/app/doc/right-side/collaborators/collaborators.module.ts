import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { CollaboratorsComponent } from './collaborators.component'
import { CollaboratorsService } from './collaborators.service'
import { SharedModule } from 'shared'

@NgModule({
  declarations: [
    CollaboratorsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [ CollaboratorsComponent ],
  providers: [ CollaboratorsService ]
})
export class CollaboratorsModule { }
