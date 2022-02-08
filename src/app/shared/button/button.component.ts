import { Component, OnInit, Input, NgModule } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocOpenDialogComponent, DocCreateDialogComponent } from '../dialogs/doc-create-open-dialog';
@Component({
  selector: 'mute-button-open-create-document',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss']
})

export class ButtonComponent implements OnInit {
  @Input() buttonConfig: any;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  ngOnDestroy() {}

  openDocument(){
    this.dialog.open(DocOpenDialogComponent);
  }

  createDocument(){
    this.dialog.open(DocCreateDialogComponent);
  }
}