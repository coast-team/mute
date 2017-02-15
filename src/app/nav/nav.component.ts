import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { MdDialog } from '@angular/material'


import { AbstractStorageService } from 'core/storage/AbstractStorageService'
import { StorageManagerService } from 'core/storage/storage-manager/storage-manager.service'
import { AddStorageDialogComponent } from './add-storage-dialog/add-storage-dialog.component'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {


  constructor (
    private route: ActivatedRoute,
    private router: Router,
    public sm: StorageManagerService,
    public dialog: MdDialog
  ) { }

  ngOnInit () {
  }

  getStorageServices (): AbstractStorageService[] {
    return this.sm.getStorageServices()
  }

  setCurrentStorageService (storageService: AbstractStorageService) {
    this.sm.setCurrentStorageService(storageService)
  }

  newDoc () {
    const MIN_LENGTH = 10
    const DELTA_LENGTH = 0
    const MASK = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    const length = MIN_LENGTH + Math.round(Math.random() * DELTA_LENGTH)

    for (let i = 0; i < length; i++) {
      key += MASK[Math.round(Math.random() * (MASK.length - 1))]
    }
    this.router.navigate(['doc/' + key])
  }

  openDialog () {
    let dialogRef = this.dialog.open(AddStorageDialogComponent)
    // dialogRef.afterClosed().subscribe((result) => {
    //   log.debug('RESULT is: ', result)
    // })
  }
}
