import { Injectable } from '@angular/core'
import { State } from 'mute-core'

import { Folder } from '../Folder'
import { BotStorageService } from './bot-storage/bot-storage.service'
import { LocalStorageService } from './local-storage.service'

@Injectable()
export class StorageService {

  public all: Folder

  constructor (
    private botStroage: BotStorageService,
    private localStorage: LocalStorageService
  ) {
    this.all = new Folder('all', 'All documents', 'view_module')
  }

  // findFolder (key: string): Folder | undefined {

  // }
}
