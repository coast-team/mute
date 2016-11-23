import { Injectable } from '@angular/core'
import * as CodeMirror from 'codemirror'

import { NetworkService } from '../core/network/network.service'
import { CollaboratorsService } from '../core/collaborators/collaborators.service'
import { DocService } from '../doc/doc.service'
import * as MuteStructs  from 'mute-structs'

@Injectable()
export class CursorService {

  private networkService: NetworkService
  private collaboratorsService: CollaboratorsService
  private docService: DocService
  private cmEditor: CodeMirror.Editor

  // Cursor objects of other collaborators, not yours.
  private cursors: Map<number, Cursor>

  constructor(
    networkService: NetworkService,
    collaboratorsService: CollaboratorsService,
    docService: DocService
  ) {
    this.networkService = networkService
    this.collaboratorsService = collaboratorsService
    this.docService = docService
    this.cursors = new Map()
  }

  init (cmEditor: CodeMirror.Editor): void {
    this.cmEditor = cmEditor
    let cmDoc: CodeMirror.Doc = cmEditor.getDoc()

    this.collaboratorsService.onJoin
      .subscribe(({id, pseudo, color}: {id: number, pseudo: string, color: string}) => {
        this.cursors.set(id, new Cursor(color))
    })

    this.collaboratorsService.onLeave.subscribe((id: number) => {
      let cursor = this.cursors.get(id)
      cursor.cmBookmark.clear()
      cursor.stopClotting()
      this.cursors.delete(id)
    })

    this.networkService.onPeerCursor
      .subscribe(({id, index, identifier}: {id: number, index: number, identifier: MuteStructs.Identifier}) => {
        if (id !== -1) {
          let cursor = this.cursors.get(id)
          let docIndex = this.docService.indexFromId(identifier) + index
          if (cursor.cmBookmark !== null) {
            cursor.restartClotting()
            cursor.cmBookmark.clear()
          } else {
            cursor.startClotting()
          }
          cursor.cmBookmark = cmDoc.setBookmark(cmDoc.posFromIndex(docIndex), {widget: cursor.domElm})
        }
    })

    CodeMirror.on(cmDoc, 'cursorActivity', () => {
      let cursor = this.docService.idFromIndex(cmDoc.indexFromPos(cmDoc.getCursor()))
      this.networkService.sendPeerCursor(cursor)
    })
  }

}

class Cursor {

  public domElm: HTMLElement
  public cmBookmark: any

  private clotIntervalID: number
  private clotTimeoutID: number

  constructor (color: string) {
    this.cmBookmark = null
    this.domElm = document.createElement('span')
    this.domElm.className = 'peerCursor'
    this.domElm.style.backgroundColor = color
  }

  startClotting (): void {
    this.clotIntervalID = window.setInterval(() => {
      if (this.domElm.className.includes('clotted')) {
        this.domElm.className = this.domElm.className.replace(' clotted', '')
      } else {
        this.domElm.className += ' clotted'
      }
    }, 600)
  }

  restartClotting (): void {
    this.stopClotting()
    this.clotTimeoutID = window.setTimeout(() => { this.startClotting() }, 400)
  }

  stopClotting (): void {
    this.domElm.className = this.domElm.className.replace(' clotted', '')
    window.clearInterval(this.clotIntervalID)
    window.clearTimeout(this.clotTimeoutID)
  }
}
