import { Injectable, OnDestroy } from '@angular/core'
import { DocService, RichLogootSOperation } from 'mute-core'
// import { LogootSOperation, TextDelete, TextInsert } from 'mute-structs'
import { map } from 'rxjs/operators'

import * as diff from 'diff'
import { from, Subscription } from 'rxjs'
import { Author } from '../core/Author'
import { Doc } from '../core/Doc'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { AUTHORS } from './mock-authors'

@Injectable()
export class HistoryService implements OnDestroy {
  private subs: Subscription[]

  constructor(private storage: LocalStorageService) {
    this.subs = []
  }

  getDiff(strA: string, strB: string): any {
    return diff.diffChars(strA, strB)
  }

  getOperations(doc: Doc): Promise<Array<IDelete | IInsert>> {
    return new Promise((resolve) => {
      this.storage
        .fetchDocContent(doc)
        .then((body: any) => {
          const logootSOp = body.richLogootSOps
            .map(
              (richLogootSOp: any): RichLogootSOperation | null => {
                return RichLogootSOperation.fromPlain(richLogootSOp)
              }
            )
            .filter((richLogootSOp: RichLogootSOperation | null) => {
              return richLogootSOp instanceof RichLogootSOperation
            })
            .map((richLogootSOp: RichLogootSOperation) => richLogootSOp.logootSOp)
          const mcDocService = new DocService(42)
          this.subs.push(
            mcDocService.onRemoteTextOperations
              .pipe(
                map(({ operations }) => {
                  return operations.map((op: any) => {
                    const randAuthor = AUTHORS[Math.floor(Math.random() * AUTHORS.length)]
                    op.authorId = randAuthor[0]
                    op.authorName = randAuthor[1]
                    return op
                  })
                })
              )
              .subscribe((ops) => resolve(ops))
          )
          mcDocService.remoteLogootSOperationSource = from(
            logootSOp.map((op) => ({
              collaborator: undefined,
              operations: [op],
            }))
          )
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

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe())
  }
}

export interface IDelete {
  authorId: number
  authorName: string
}

export interface IInsert {
  authorId: number
  authorName: string
}
