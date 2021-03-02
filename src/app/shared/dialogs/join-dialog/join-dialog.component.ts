import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'

@Component({
  selector: 'mute-join-dialog',
  templateUrl: './join-dialog.component.html',
  styleUrls: ['./join-dialog.component.css'],
})
export class JoinDialogComponent {
  public keyControl: FormControl

  constructor(private router: Router) {
    this.keyControl = new FormControl('', [Validators.maxLength(512)])
    this.keyControl.setValue('')
  }

  join() {
    this.router.navigateByUrl(`/${this.keyControl.value}`)
  }
}
