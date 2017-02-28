import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../core/storage/AbstractStorageService'
import { StorageManagerService } from '../core/storage/storage-manager/storage-manager.service'
import { LocalStorageService } from '../core/storage/local-storage/local-storage.service'
import { AddStorageDialogComponent } from './add-storage-dialog/add-storage-dialog.component'
import { File } from '../core/storage/File'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public files: Observable<File[]>
  public trash: File

  constructor (
    private router: Router,
    public sm: StorageManagerService,
    public ls: LocalStorageService
  ) { }

  ngOnInit () {
    this.sm.getRootFiles()
      .then((rootFiles) => {

      })
    this.files = Observable.fromPromise(this.sm.getRootFiles())
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

  setActiveFile ({value}) {
    this.sm.setActiveFile(value)
  }

  // openDialog () {
  //   let dialogRef = this.dialog.open(AddStorageDialogComponent)
  //   // dialogRef.afterClosed().subscribe((result) => {
  //   //   log.debug('RESULT is: ', result)
  //   // })
  // }
}
