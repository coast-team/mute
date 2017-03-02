import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Rx'

import { StorageOverviewService, LocalStorageService, BotStorageService } from '../core/storage'
import { Folder } from '../core/Folder'
import { File } from '../core/File'
// import { AddStorageDialogComponent } from './add-storage-dialog/add-storage-dialog.component'
import { UiService } from '../core/ui/ui.service'

@Component({
  selector: 'mute-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public files: Promise<File[]>
  public trash: Folder

  constructor (
    private router: Router,
    public storageOverview: StorageOverviewService,
    public localStorage: LocalStorageService,
    public botStorage: BotStorageService,
    public ui: UiService,
  ) { }

  ngOnInit () {
    log.angular('NavComponent init')
    this.files = this.botStorage.getRootFolders()
      .then((folders) => {
        const resFolders = [
          this.storageOverview.allDocs,
          this.localStorage.home
        ]
        folders.forEach((folder) => resFolders.push(folder))
        return resFolders
      })
    this.trash = this.localStorage.trash
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
    this.ui.setActiveFile(value)
  }

  // openDialog () {
  //   let dialogRef = this.dialog.open(AddStorageDialogComponent)
  //   // dialogRef.afterClosed().subscribe((result) => {
  //   //   log.debug('RESULT is: ', result)
  //   // })
  // }
}
