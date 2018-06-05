import { CommonModule, DatePipe } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material'
import { RouterModule } from '@angular/router'
import 'hammerjs/hammer'
import { ConfigDialogComponent } from './config-dialog/config-dialog.component'
import { DocRenameDialogComponent } from './doc-rename-dialog/doc-rename-dialog.component'
import { JoinDialogComponent } from './nav/join-dialog/join-dialog.component'
import { NavComponent } from './nav/nav.component'
import { DateEnhancedPipe } from './pipes/dateEnhanced.pipe'
import { RemotePipe } from './pipes/remote.pipe'
import { SizePipe } from './pipes/size.pipe'
import { ProfileComponent } from './profile/profile.component'
import { RemoteDeleteDialogComponent } from './remote-delete-dialog/remote-delete-dialog.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  entryComponents: [ConfigDialogComponent, DocRenameDialogComponent, RemoteDeleteDialogComponent, JoinDialogComponent],
  providers: [DatePipe],
  declarations: [
    ProfileComponent,
    NavComponent,
    SizePipe,
    RemotePipe,
    DateEnhancedPipe,
    ConfigDialogComponent,
    DocRenameDialogComponent,
    RemoteDeleteDialogComponent,
    JoinDialogComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    NavComponent,
    ProfileComponent,
    RemotePipe,
    DateEnhancedPipe,
  ],
})
export class SharedModule {}
