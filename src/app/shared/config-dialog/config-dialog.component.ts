import { Component, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material'
import { ErrorStateMatcher } from '@angular/material/core'

import { Profile } from '../../core/profile/Profile'
import { ProfileService } from '../../core/profile/profile.service'

@Component({
  selector: 'mute-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss']
})
export class ConfigDialogComponent {

  public profile: Profile

  public displayNameFormControl: FormControl

  constructor (
    public dialogRef: MatDialogRef<ConfigDialogComponent>,
    public profileService: ProfileService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.profile = profileService.profile
    this.displayNameFormControl = new FormControl('', [
      Validators.maxLength(27),
    ])
  }

  save (nickname: string) {
    this.profile.displayName = nickname
  }

}
