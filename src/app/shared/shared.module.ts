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
import { DateEnhancedPipe } from './pipes/date-enhanced.pipe'
import { RemotePipe } from './pipes/remote.pipe'
import { SizePipe } from './pipes/size.pipe'
import { ProfileComponent } from './profile/profile.component'
import { RemoteDeleteDialogComponent } from './remote-delete-dialog/remote-delete-dialog.component'

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatSliderModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatProgressBarModule,
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
    ReactiveFormsModule,
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
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatSelectModule,
    MatSliderModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatProgressBarModule,
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
    ReactiveFormsModule,
    RemotePipe,
    DateEnhancedPipe,
  ],
})
export class SharedModule {}
