import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, Subject } from 'rxjs/Rx'

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

  private filesSubject: Subject<File[]>

  public files: Observable<File[]>

  constructor (
    private router: Router,
    public storageOverview: StorageOverviewService,
    public localStorage: LocalStorageService,
    public botStorage: BotStorageService,
    public ui: UiService,
  ) {
    this.filesSubject = new Subject()
    this.files = this.filesSubject.asObservable()
  }

  ngOnInit () {
    log.angular('NavComponent init')
    const resFolders = [
      this.storageOverview.allDocs,
      this.localStorage.home
    ]
    this.botStorage.getRootFolders()
      .then((folders) => {
        folders.forEach((folder) => resFolders[resFolders.length] = folder)
        resFolders[resFolders.length] = this.localStorage.trash
        this.filesSubject.next(resFolders)
      })
      .catch(() => {
        resFolders[resFolders.length] = this.localStorage.trash
        this.filesSubject.next(resFolders)
      })
  }

  newDoc () {
    const doc = this.localStorage.createDoc()
    this.ui.setActiveFile(doc)
    this.router.navigate(['/doc', doc.id])
  }

  setActiveFile ({value}) {
    log.debug('Setting active file: ', value)
    this.ui.setActiveFile(value)
  }

  // openDialog () {
  //   let dialogRef = this.dialog.open(AddStorageDialogComponent)
  //   // dialogRef.afterClosed().subscribe((result) => {
  //   //   log.debug('RESULT is: ', result)
  //   // })
  // }
}
