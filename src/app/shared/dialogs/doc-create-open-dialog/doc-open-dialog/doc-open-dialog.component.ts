import { Component} from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'mute-doc-open-dialog',
  templateUrl: './doc-open-dialog.component.html',
  styleUrls: ['../doc-create-open-dialog.component.scss'],
})
export class DocOpenDialogComponent {
  public keyControl: FormControl
  public documentIdentifierSize = 10

  constructor(private router: Router, private dialogRef: MatDialogRef<DocOpenDialogComponent>) {
    this.keyControl = new FormControl('', [Validators.required, Validators.minLength(10),Validators.maxLength(10)])
    this.keyControl.setValue('')
  }

  openDocument() {
    if (this.keyControl.value != ''){
      this.dialogRef.close()
      this.router.navigateByUrl(`/${this.keyControl.value}`)
    }
  }
 
}
