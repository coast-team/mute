import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { SharedModule } from '../../../shared'
import { CollaboratorsComponent } from './collaborators.component'

@NgModule({
  declarations: [
    CollaboratorsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [ CollaboratorsComponent ],
  providers: []
})
export class CollaboratorsModule { }
