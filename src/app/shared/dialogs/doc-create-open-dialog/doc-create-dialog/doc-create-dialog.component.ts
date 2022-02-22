import { Component, HostListener, OnDestroy} from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router'
import { LocalStorageService } from '@app/core/storage'
import { muteConsts } from '@app/shared/muteConsts';

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
  public documentNameMaxSize : number
  public defaultNameForDoc = "Untitled Document"

  constructor(private router: Router,
     private localStorage: LocalStorageService,
     private dialogRef: MatDialogRef<DocCreateDialogComponent>
     ) {
    this.documentNameMaxSize = muteConsts.documentNameMaxSize
    this.typeOfDocument = "noBotStorage"
    this.documentName = ""
    this.accessingDocument = false
  }

  ngOnInit() {
  }

  ngOnDestroy(){
  }

  /**
   * This function creates a document, 
   * and depending on user input, 
   * modify its name or acces it, or both
   */
  async createDocument (accessingDocument? : true) {
    const key = this.localStorage.generateSignalingKey()
    this.prepareType()
    let doc = await this.localStorage.createDoc(key, this.documentName, this.typeOfDocument)

    if (accessingDocument){
      this.router.navigate(['/', doc.signalingKey])
    }
    this.localStorage.newFileNotifier.next()
  }

  /**
   * Will return the parameter necessary to create
   * the type of document the user will create
   */
   prepareType(){
    let typeDocument = {}
    switch(this.typeOfDocument){
      case "noBotStorage" :{
        this.typeOfDocument = muteConsts.isWithoutBotStorage
        break;
      }
      case "pulsar" :{
        this.typeOfDocument = muteConsts.isWithPulsar
        break;
      }
      default: {
        break;
      }
    }
    return typeDocument
  }

  /**
   * Close the dialog when the user hits enter on its keyboard
   */
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

}