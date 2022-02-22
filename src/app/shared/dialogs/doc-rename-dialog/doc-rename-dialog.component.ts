import { Component, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Doc } from '../../../core/Doc'
import { LocalStorageService } from '../../../core/storage/local/local-storage.service'
import { muteConsts } from '@app/shared/muteConsts'


@Component({
  selector: 'mute-doc-rename-dialog',
  templateUrl: './doc-rename-dialog.component.html',
  styleUrls: ['./doc-rename-dialog.component.css'],
})
export class DocRenameDialogComponent {
  public titleControl: FormControl
  private doc: Doc
  public documentNameMaxSize : number

  constructor(
    public dialogRef: MatDialogRef<DocRenameDialogComponent>,
    public localStorage: LocalStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.documentNameMaxSize = muteConsts.documentNameMaxSize
    this.doc = data
    this.titleControl = new FormControl('', [Validators.maxLength(28)])
    this.titleControl.setValue(this.doc.title)
  }

  selectAll(event: FocusEvent) {
    ;(event.target as HTMLInputElement).select()
  }

  updateTitle() {
    this.doc.title = this.titleControl.value
    this.localStorage.newFileNotifier.next()
  }
}
