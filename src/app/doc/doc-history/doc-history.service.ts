import { Injectable } from '@angular/core'
import { RichLogootSOperation } from 'mute-core'
import { DocService } from 'mute-core'
import { LogootSAdd, LogootSDel, TextDelete, TextInsert } from 'mute-structs'
import { Observable } from 'rxjs/Observable'

import * as diff from 'diff'
import { Author } from '../../core/Author'
import { Doc } from '../../core/Doc'
import { StorageService } from '../../core/storage/storage.service'
import { RichCollaboratorsService } from '../rich-collaborators/rich-collaborators.service'
import { AUTHORS } from './mock-authors'

@Injectable()
export class DocHistoryService {

  constructor (
    private storage: StorageService,
    private collaboratorsService: RichCollaboratorsService
  ) {}

  getDiff (strA: string, strB: string): any {
    return diff.diffChars(strA, strB)
  }

  getOperations (doc: Doc): Promise<Array<IDelete|IInsert>> {
    return new Promise((resolve) => {
      this.storage.getDocBody(doc)
        .then((body: any) => {
          const logootSOp: Array<LogootSAdd | LogootSDel> = body.richLogootSOps
            .map((richLogootSOp: any): RichLogootSOperation | null => {
              return RichLogootSOperation.fromPlain(richLogootSOp)
            })
            .filter((richLogootSOp: RichLogootSOperation | null) => {
              return richLogootSOp instanceof RichLogootSOperation
            })
            .map((richLogootSOp: RichLogootSOperation) => richLogootSOp.logootSOp)
          const mcDocService = new DocService(42)
          mcDocService.onRemoteTextOperations
            .map((ops: Array<TextDelete | TextInsert>) => {
              return ops.map((op: IDelete | IInsert) => {
                const randAuthor = AUTHORS[Math.floor(Math.random() * AUTHORS.length)]
                op.authorId = randAuthor[0]
                op.authorName = randAuthor[1]
                return op
              })
            }).subscribe((ops) => resolve(ops))
          mcDocService.remoteLogootSOperationSource = Observable.from([logootSOp])
        })
        .catch(() => {
          log.error('Error getting document body of: ', doc)
        })
    })
  }

  getAuthors (doc: Doc): Promise<Author[]> {
    return new Promise((resolve) => {
      const docAuthors: Author[] = []
      this.getOperations(doc)
          .then((ops: Array<IDelete | IInsert>) => {
            for (const o of ops) {
              // log.debug(o.authorName)
              const author: Author = new Author(o.authorName, o.authorId, this.collaboratorsService.pickColor())

              if (docAuthors.filter((e) => {
                return e.getId() === author.getId()
              }).length === 0) {
                docAuthors.push(author)
              }
            }
            resolve(docAuthors)
          })
    })
  }

}

export interface IDelete extends TextDelete {
  authorId: number,
  authorName: string
}

export interface IInsert extends TextInsert {
  authorId: number,
  authorName: string
}
