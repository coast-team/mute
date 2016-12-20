import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MaterialModule } from '@angular/material'

import { CollaboratorsComponent } from './collaborators.component'
import { CollaboratorsService } from './collaborators.service'


@NgModule({
  declarations: [
    CollaboratorsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule.forRoot()
  ],
  exports: [ CollaboratorsComponent ],
  providers: [ CollaboratorsService ]
})
export class CollaboratorsModule { }
