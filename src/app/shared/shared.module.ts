import {
  MdInputModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdSliderModule,
  MdSidenavModule,
  MdListModule,
  MdProgressSpinnerModule,
  MdSnackBarModule,
  MdToolbarModule,
  MdIconModule,
  MdTooltipModule,
  MdMenuModule,
  MdChipsModule } from '@angular/material'
import { NgModule } from '@angular/core'
import 'hammerjs/hammer'
import { CommonModule } from '@angular/common'
import { FlexLayoutModule } from '@angular/flex-layout'

import { EditFieldComponent } from './edit-field/edit-field.component'

@NgModule({
  imports: [
    CommonModule,
    MdInputModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdCardModule,
    MdSliderModule,
    MdSidenavModule,
    MdListModule,
    MdProgressSpinnerModule,
    MdSnackBarModule,
    MdToolbarModule,
    MdIconModule,
    MdTooltipModule,
    MdChipsModule,
    MdMenuModule,
    FlexLayoutModule
  ],
  declarations: [ EditFieldComponent ],
  exports: [
    CommonModule,
    MdInputModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdCardModule,
    MdSliderModule,
    MdSidenavModule,
    MdListModule,
    MdProgressSpinnerModule,
    MdSnackBarModule,
    MdToolbarModule,
    MdIconModule,
    MdTooltipModule,
    MdChipsModule,
    MdMenuModule,
    FlexLayoutModule,
    EditFieldComponent
  ]
})
export class SharedModule {

  constructor () {
    log.angular('SharedModule constructed')
  }
}
