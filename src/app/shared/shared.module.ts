import {
  MatInputModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatSliderModule,
  MatSidenavModule,
  MatListModule,
  MatGridListModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatIconModule,
  MatTooltipModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatTabsModule, } from '@angular/material'
import { NgModule } from '@angular/core'
import 'hammerjs/hammer'
import { CommonModule } from '@angular/common'
import { FlexLayoutModule } from '@angular/flex-layout'

import { EditFieldComponent } from './edit-field/edit-field.component'

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatSliderModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule,
    FlexLayoutModule,
    MatTabsModule
  ],
  declarations: [ EditFieldComponent ],
  exports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatSliderModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule,
    FlexLayoutModule,
    EditFieldComponent,
    MatTabsModule
  ]
})
export class SharedModule {}
