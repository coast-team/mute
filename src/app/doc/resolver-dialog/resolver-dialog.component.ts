import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material'

import { Doc } from '../../core/Doc'
import { BotStorageService } from '../../core/storage/bot/bot-storage.service'

@Component({
  selector: 'mute-resolver-dialog',
  templateUrl: './resolver-dialog.component.html',
  styleUrls: ['./resolver-dialog.component.scss']
})
export class ResolverDialogComponent implements OnInit {

  public remoteName: string

  constructor (
    private botStorage: BotStorageService,
    @Inject(MAT_DIALOG_DATA) public doc: Doc
  ) {
    if (botStorage.remote && botStorage.status === BotStorageService.AVAILABLE) {
      this.remoteName = botStorage.id
    }
  }

  ngOnInit () {
  }

}
