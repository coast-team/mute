import { NgModule } from '@angular/core'
import 'hammerjs/hammer'
import { MaterialModule } from '@angular/material'
import { CommonModule } from '@angular/common'
import { FlexLayoutModule } from '@angular/flex-layout'

import { EditFieldComponent } from './edit-field/edit-field.component'

@NgModule({
  imports: [
    CommonModule,
    MaterialModule.forRoot(),
    FlexLayoutModule.forRoot()
  ],
  declarations: [ EditFieldComponent ],
  exports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    EditFieldComponent
  ]
})
export class SharedModule {

  constructor () {
    log.angular('SharedModule constructed')
  }
}
