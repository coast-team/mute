import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material'
import { ErrorStateMatcher } from '@angular/material/core'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'

@Component({
  selector: 'mute-doc-rename-dialog',
  templateUrl: './doc-rename-dialog.component.html',
  styleUrls: ['./doc-rename-dialog.component.css'],
})
export class DocRenameDialogComponent {
  public title: string
  public titleFormControl: FormControl

  private doc: Doc

  constructor(
    public dialogRef: MatDialogRef<DocRenameDialogComponent>,
    public localStorage: LocalStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.doc = data
    this.title = this.doc.title
    this.titleFormControl = new FormControl('', [Validators.maxLength(128)])
  }

  selectAll(event: FocusEvent) {
    ;(event.target as HTMLInputElement).select()
  }

  save() {
    if (this.title !== '') {
      this.doc.title = this.title
      this.localStorage.save(this.doc)
    }
  }
}
