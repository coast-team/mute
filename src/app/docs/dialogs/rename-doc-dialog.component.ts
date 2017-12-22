import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

@Component({
  selector: 'mute-rename-doc-dialog',
  templateUrl: 'rename-doc-dialog.html',
})
export class RenameDocDialogComponent {

  @ViewChild('titleRef') titleRef: ElementRef
  titleControl: FormControl

  constructor (
    public dialogRef: MatDialogRef<RenameDocDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {
    this.titleControl = new FormControl('', [Validators.required])
  }

  selectAll () {
    this.titleRef.nativeElement.select()
  }

  close (): void {
    this.dialogRef.close()
  }

}
