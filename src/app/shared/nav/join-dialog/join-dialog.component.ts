import { Component, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA } from '@angular/material'
import { Router } from '@angular/router'

@Component({
  selector: 'mute-join-dialog',
  templateUrl: './join-dialog.component.html',
  styleUrls: ['./join-dialog.component.css']
})
export class JoinDialogComponent {

  public key: string
  public keyFormControl: FormControl

  constructor (
    private router: Router
  ) {
    this.key = ''
    this.keyFormControl = new FormControl('', [
      Validators.maxLength(512),
    ])
  }

  join () {
    this.router.navigateByUrl(`/${this.key}`)
  }

}
