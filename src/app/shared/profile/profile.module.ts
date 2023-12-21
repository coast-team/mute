import { NgModule } from '@angular/core'
import { MatDialogModule } from '@angular/material/dialog'
import { ProfileComponent } from './profile.component'
import { AvatarComponent } from '../avatar'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  imports: [MatDialogModule, MatCardModule, MatIconModule],
  declarations: [ProfileComponent, AvatarComponent],
  exports: [MatDialogModule, MatCardModule, MatIconModule, ProfileComponent, AvatarComponent],
})
export class ProfileModule {}
