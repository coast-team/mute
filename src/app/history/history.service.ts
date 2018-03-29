import { Injectable } from '@angular/core'
import { DocService, RichLogootSOperation } from 'mute-core'
import { LogootSOperation, TextDelete, TextInsert, TextOperation } from 'mute-structs'
import { from } from 'rxjs/observable/from'
import { map } from 'rxjs/operators'

import * as diff from 'diff'
import { Author } from '../core/Author'
import { Doc } from '../core/Doc'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { AUTHORS } from './mock-authors'

@Injectable()
export class HistoryService {
  constructor(private storage: LocalStorageService) {}

  getDiff(strA: string, strB: string): any {
    return diff.diffChars(strA, strB)
  }

  getOperations(doc: Doc): Promise<Array<IDelete | IInsert>> {
    return new Promise((resolve) => {
      this.storage
        .getDocBody(doc)
        .then((body: any) => {
          const logootSOp: LogootSOperation[] = body.richLogootSOps
            .map((richLogootSOp: any): RichLogootSOperation | null => {
              return RichLogootSOperation.fromPlain(richLogootSOp)
            })
            .filter((richLogootSOp: RichLogootSOperation | null) => {
              return richLogootSOp instanceof RichLogootSOperation
            })
            .map((richLogootSOp: RichLogootSOperation) => richLogootSOp.logootSOp)
          const mcDocService = new DocService(42)
          mcDocService.onRemoteTextOperations
            .pipe(
              map((ops: TextOperation[]) => {
                return ops.map((op: IDelete | IInsert) => {
                  const randAuthor = AUTHORS[Math.floor(Math.random() * AUTHORS.length)]
                  op.authorId = randAuthor[0]
                  op.authorName = randAuthor[1]
                  return op
                })
              })
            )
            .subscribe((ops) => resolve(ops))
          mcDocService.remoteLogootSOperationSource = from([logootSOp])
        })
        .catch((err) => {
          log.error('Error getting document body of: ', doc)
        })
    })
  }

  getAuthors(doc: Doc): Promise<Author[]> {
    return new Promise((resolve) => {
      const docAuthors: Author[] = []
      this.getOperations(doc).then((ops: Array<IDelete | IInsert>) => {
        for (const o of ops) {
          const author: Author = new Author(o.authorName, o.authorId, '#9CCC65')

          if (
            docAuthors.filter((e) => {
              return e.getId() === author.getId()
            }).length === 0
          ) {
            docAuthors.push(author)
          }
        }
        resolve(docAuthors)
      })
    })
  }
}

export interface IDelete extends TextDelete {
  authorId: number
  authorName: string
}

export interface IInsert extends TextInsert {
  authorId: number
  authorName: string
}
