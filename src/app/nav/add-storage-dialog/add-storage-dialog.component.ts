import { Component } from '@angular/core'
import { MdDialogRef } from '@angular/material'

@Component({
  selector: 'mute-add-storage-dialog',
  templateUrl: './add-storage-dialog.component.html'
})
export class AddStorageDialogComponent {

  constructor (
    public dialogRef: MdDialogRef<AddStorageDialogComponent>
  ) { }
}
