import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'mute-remote-delete-dialog',
  templateUrl: './remote-delete-dialog.component.html',
  styleUrls: ['./remote-delete-dialog.component.css'],
})
export class RemoteDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public title: string) {}
}
