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
      if (cursor.cmBookmark !== null) {
        cursor.cmBookmark.clear()
      }
      cursor.stopClotting()
      this.cursors.delete(id)
    })

    this.networkService.onPeerCursor
      .subscribe(({id, index, identifier}:
        {id: number, index: number, identifier: MuteStructs.Identifier}) => {
        if (id !== -1) {
          let cursor = this.cursors.get(id)
          if (cursor !== undefined) {
            if (cursor.cmBookmark === null) {
              cursor.startClotting()
            } else {
              cursor.restartClotting()
              // cursor.cmBookmark.clear()
            }
            if (index === -2) {
              cursor.stopClotting()
            } else {
              let pos: any
              if (index === -1) {
                let lastLine = cmDoc.lastLine()
                pos = {line: lastLine, pos: cmDoc.getLine(lastLine).length}
              } else {
                pos = cmDoc.posFromIndex(this.docService.indexFromId(identifier) + index)
              }
              if (cursor.cmBookmark !== null) {
                let oldCoords = this.cmEditor.cursorCoords(cursor.cmBookmark.find(), 'local')
                let newCoords = this.cmEditor.cursorCoords(pos, 'local')
                let translateCoords = {x: newCoords.left - oldCoords.left, y: newCoords.top - oldCoords.top}
                cursor.translate(translateCoords)
              } else {
                cursor.cmBookmark = cmDoc.setBookmark(pos, {widget: cursor.domElm})
              }
            }
          }
        }
    })

    CodeMirror.on(cmDoc, 'cursorActivity', () => {
      let cursor: {index: number, last?: number, base?: number[]}
        = this.docService.idFromIndex(cmDoc.indexFromPos(cmDoc.getCursor()))
      if (cursor === null) {
        cursor = {index: -1}
      }
      this.networkService.sendPeerCursor(cursor)
    })

    CodeMirror.on(this.cmEditor, 'blur', (event: Event) => {
      this.networkService.sendPeerCursor({ index: -2 })
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

  translate(coords) {
    this.domElm.style.transform = `translate(${Math.round(coords.x)}px, ${Math.round(coords.y)}px)`
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
    // window.setTimeout(() => {
    //   this.domElm.style.transform = 'translate(200px, 300px)'
    //
    // }, 7000)
  }

  stopClotting (): void {
    this.domElm.className = this.domElm.className.replace(' clotted', '')
    window.clearInterval(this.clotIntervalID)
    window.clearTimeout(this.clotTimeoutID)
  }
}
