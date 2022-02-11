import { CommonModule, DatePipe } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout'

import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSliderModule } from '@angular/material/slider'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import {MatCheckboxModule} from '@angular/material/checkbox';

import { AvatarComponent } from './avatar/avatar.component'
import {
  ConfigDialogComponent,
  DocRenameDialogComponent,
  RemoteDeleteDialogComponent,
  DocCreateDialogComponent,
  DocOpenDialogComponent
} from './dialogs'
import { NavComponent } from './nav/nav.component'
import { ProfileComponent } from './profile/profile.component'

import { DateEnhancedPipe } from './pipes/dateEnhanced.pipe'
import { RemotePipe } from './pipes/remote.pipe'
import { SizePipe } from './pipes/size.pipe'
import { ButtonComponent } from './button/button.component'

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
    MatCheckboxModule,
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
    MatTooltipModule
  ],
  providers: [
    DatePipe
  ],
  declarations: [
    DocCreateDialogComponent,
    DocOpenDialogComponent,
    ProfileComponent,
    NavComponent,
    ConfigDialogComponent,
    DocRenameDialogComponent,
    RemoteDeleteDialogComponent,
    AvatarComponent,

    SizePipe,
    RemotePipe,
    DateEnhancedPipe,
    ButtonComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
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

    DocCreateDialogComponent,
    DocOpenDialogComponent,
    NavComponent,
    ProfileComponent,
    AvatarComponent,

    RemotePipe,
    DateEnhancedPipe,
    ButtonComponent
  ]
})
export class SharedModule {}
