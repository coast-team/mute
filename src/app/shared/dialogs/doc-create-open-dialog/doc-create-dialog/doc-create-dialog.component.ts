import { Component, HostListener, OnDestroy} from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';

import { Router } from '@angular/router'
import { LocalStorageService } from '@app/core/storage'

@Component({
  selector: 'mute-doc-create-dialog',
  templateUrl: './doc-create-dialog.component.html',
  styleUrls: ['../doc-create-open-dialog.component.scss'],
})
export class DocCreateDialogComponent implements OnDestroy {

  public typeOfDocument : string;
  
  constructor(private router: Router, private localStorage: LocalStorageService, private dialogRef: MatDialogRef<DocCreateDialogComponent>) {
    this.typeOfDocument = "noBotStorage"
  }

  ngOnInit() {
  }

  @HostListener('window:keyup.Enter', ['$event'])
  onDialogSpace(event: KeyboardEvent): void {
    this.createDocument()
    this.closeDialog()
  }

  ngOnDestroy(){
  }

  setNoBotStorage(){
    this.typeOfDocument = "noBotStorage"
  }

  setPulsar(){
    this.typeOfDocument = "pulsar"
  }

  closeDialog(){
    this.dialogRef.close()
  }


  createDocument(){
    switch(this.typeOfDocument){
      case "noBotStorage" :{
        this.createDoc(false)
        break;
      }
      case "pulsar" :{
        this.createDocPulsar(false)
        break;
      }
      default: {
        break;
      }
    }
  }

  createDoc(remotely = false){
    const key = this.localStorage.generateSignalingKey()
    if (remotely) {
      this.router.navigate(['/', key, { remote: true }])
    } else {
      this.router.navigate(['/', key])
    }
  }

  createDocPulsar(pulsar = false){
    const key = this.localStorage.generateSignalingKey()
    if (pulsar) {
      this.router.navigate(['/', key, { pulsar: true }])
    } else {
      this.router.navigate(['/', key])
    }
  }
}