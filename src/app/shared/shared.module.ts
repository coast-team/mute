import { NgModule } from '@angular/core'
import { MaterialModule } from '@angular/material'
import { CommonModule } from '@angular/common'
import { FlexLayoutModule } from '@angular/flex-layout'

import { PseudonymComponent } from './pseudonym/pseudonym.component'

@NgModule({
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    FlexLayoutModule.forRoot()
  ],
  declarations: [ PseudonymComponent ],
  exports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    PseudonymComponent
  ]
})
export class SharedModule { }
