import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatChipsModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import 'hammerjs/hammer'
import { ConfigDialogComponent } from './config-dialog/config-dialog.component'
import { NavComponent } from './nav/nav.component'
import { SizePipe } from './nav/size-pipe/size-pipe'
import { ProfileComponent } from './profile/profile.component'

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
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [ ConfigDialogComponent ],
  declarations: [ ProfileComponent, NavComponent, SizePipe, ConfigDialogComponent],
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
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    ProfileComponent,
    NavComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule {}
