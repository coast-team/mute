import { Component, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material'
import { ErrorStateMatcher } from '@angular/material/core'

import { Profile } from '../../core/settings/Profile'
import { SettingsService } from '../../core/settings/settings.service'

@Component({
  selector: 'mute-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss']
})
export class ConfigDialogComponent {

  public profile: Profile
  public initialTheme: string
  public theme: string
  public displayName: string

  public displayNameFormControl: FormControl

  constructor (
    public dialogRef: MatDialogRef<ConfigDialogComponent>,
    public settings: SettingsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.profile = settings.profile
    this.displayName = this.profile.displayName
    this.initialTheme = this.settings.theme
    this.theme = this.settings.theme
    this.displayNameFormControl = new FormControl('', [
      Validators.maxLength(27),
    ])
  }

  cancel () {
    this.settings.updateTheme(this.initialTheme)
  }

  save () {
    this.profile.displayName = this.displayName
    this.settings.updateTheme(this.theme)
  }

  applyTheme ({ value }: { value: string }) {
    this.settings.updateTheme(value)
  }

}
