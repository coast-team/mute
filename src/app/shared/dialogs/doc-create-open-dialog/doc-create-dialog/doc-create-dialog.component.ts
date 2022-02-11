import { Component, HostListener, OnDestroy} from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';

import { Router } from '@angular/router'
import { LocalStorageService } from '@app/core/storage'
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mute-doc-create-dialog',
  templateUrl: './doc-create-dialog.component.html',
  styleUrls: ['../doc-create-open-dialog.component.scss'],
})
export class DocCreateDialogComponent implements OnDestroy {
  public typeOfDocument : string
  public documentName : string
  public accessingDocument : boolean

  //Constants
  public documentNameMaxSize = 25
  public defaultNameForDoc = "Untitled Document"

  constructor(private router: Router,
     private localStorage: LocalStorageService,
     private dialogRef: MatDialogRef<DocCreateDialogComponent>
     ) {
    this.typeOfDocument = "noBotStorage"
    this.documentName = ""
    this.accessingDocument = false
  }

  ngOnInit() {
  }

  ngOnDestroy(){
  }

  @HostListener('window:keyup.Enter', ['$event'])
  onDialogSpace(event: KeyboardEvent): void {
    this.createDocument()
    this.closeDialog()
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

  /**
   * This function creates a document, and depending on user input, modify its name or acces it, or both
   */
  async createDocument () {
    const key = this.localStorage.generateSignalingKey()
    let doc = await this.localStorage.createDoc(key)
    doc.title = this.documentName || this.defaultNameForDoc
    await this.localStorage.save(doc)
    this.localStorage.newFileNotifier.next()

    let typeDocument = {}
    switch(this.typeOfDocument){
      case "noBotStorage" :{
        typeDocument = { remote: true }
        break;
      }
      case "pulsar" :{
        typeDocument = { pulsar: true }
        break;
      }
      default: {
        break;
      }
    }
    if (this.accessingDocument){
      this.router.navigate(['/', doc.signalingKey, typeDocument])
    } 
  }
}