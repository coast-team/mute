import { Component, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

import { Profile } from '../../core/settings/Profile'
import { SettingsService } from '../../core/settings/settings.service'

@Component({
  selector: 'mute-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss'],
})
export class ConfigDialogComponent {
  public profile: Profile
  public initialTheme: string
  public theme: string
  public initialDisplayLogs: boolean
  public displayLogs: boolean

  public displayNameControl: FormControl

  constructor(
    public dialogRef: MatDialogRef<ConfigDialogComponent>,
    public settings: SettingsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.profile = settings.profile
    this.initialTheme = this.settings.theme
    this.initialDisplayLogs = this.settings.displayLogs
    this.theme = this.settings.theme
    this.displayLogs = this.settings.displayLogs
    this.displayNameControl = new FormControl('', [Validators.maxLength(27)])
    this.displayNameControl.setValue(this.profile.displayName)
  }

  cancel() {
    this.settings.updateTheme(this.initialTheme)
    this.settings.updateDisplayLogs(this.initialDisplayLogs)
  }

  save() {
    this.profile.displayName = this.displayNameControl.value
    this.settings.updateTheme(this.theme)
    this.settings.updateDisplayLogs(this.displayLogs)
  }

  applyTheme({ value }: { value: string }) {
    this.settings.updateTheme(value)
  }

  toggleDisplayLogs(event) {
    this.displayLogs = event.checked
    this.settings.updateDisplayLogs(event.checked)
  }

  selectAll(event: FocusEvent) {
    ;(event.target as HTMLInputElement).select()
  }
}
