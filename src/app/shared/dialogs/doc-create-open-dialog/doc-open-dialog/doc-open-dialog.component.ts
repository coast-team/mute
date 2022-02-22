import { Component} from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MatDialogRef } from "@angular/material/dialog";
import { muteConsts } from '@app/shared/muteConsts';

@Component({
  selector: 'mute-doc-open-dialog',
  templateUrl: './doc-open-dialog.component.html',
  styleUrls: ['../doc-create-open-dialog.component.scss'],
})
export class DocOpenDialogComponent {
  public keyControl: FormControl
  public documentSignalingKeyMaxSize: number

  public regex = new RegExp("^[A-Za-z0-9_-]{" + muteConsts.documentSignalingKeyMaxSize + "}$");

  constructor(private router: Router, private dialogRef: MatDialogRef<DocOpenDialogComponent>) {
    this.documentSignalingKeyMaxSize = muteConsts.documentSignalingKeyMaxSize
    this.keyControl = new FormControl('', [Validators.required, Validators.minLength(this.documentSignalingKeyMaxSize),Validators.maxLength(this.documentSignalingKeyMaxSize)])
    this.keyControl.setValue('')
  }

  /**
   * Opens a document by accessing the url
   */
  openDocument() {
    if (this.keyControl.value != ''){
      this.dialogRef.close()
      if (this.regex.test(this.keyControl.value)){
        this.router.navigateByUrl(`/${this.keyControl.value}`)
      } else {
        alert(muteConsts.koAccessDocument)
      }
    }
  }
 
}
