import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'
import { JoinEvent, RichLogootSOperation, State } from 'mute-core'
import { TextDelete, TextInsert }  from 'mute-structs'
import { DocService } from 'mute-core/lib'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local-storage/local-storage.service'


@Injectable()
export class DocHistoryService {

  constructor (
    private localStorage: LocalStorageService
  ) {}

  getOperations (doc: Doc): Promise<(TextDelete|TextInsert)[]> {
    return this.localStorage.getBody(doc)
        .then((body: any) => {
          const richLogootSOps: RichLogootSOperation[] = body.richLogootSOps
            .map((richLogootSOp: any): RichLogootSOperation | null => {
              return RichLogootSOperation.fromPlain(richLogootSOp)
            })
            .filter((richLogootSOp: RichLogootSOperation | null) => {
              return richLogootSOp instanceof RichLogootSOperation
            })
            // Use mute-core docService to transform RichLogootSOperation to TextDelete|TextInsert
          const mcDocService = new DocService(42)
          // mcDocService.handleRemoteOperation(richLogootSOps.logootSOp)
          // Look at muteCore.DocService: #remoteLogootSOperationSource & #handleRemoteOperation
        })
        .catch((err) => {
          log.error('Error getting document body of: ', doc)
        })
  }
}
