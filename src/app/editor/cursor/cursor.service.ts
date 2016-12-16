import { Injectable } from '@angular/core'
import * as CodeMirror from 'codemirror'
import { Identifier } from 'mute-structs'

import { CollaboratorsService, Collaborator } from 'core/collaborators'
import { NetworkService, NetworkMessage } from 'core/network'
import { DocService } from 'doc/doc.service'
const pb = require('./cursor_pb.js')

@Injectable()
export class CursorService {

  private cmEditor: CodeMirror.Editor

  private cmCursors: Map<number, CmCursor> // CodeMirror cursors of other peers
  private pbCursor: any
  private pbPosition: any // My cursor

  constructor (
    private network: NetworkService,
    private collaborators: CollaboratorsService,
    private doc: DocService
  ) {
    this.cmCursors = new Map()
    this.pbPosition = new pb.Position()
    this.pbCursor = new pb.Cursor()
  }

  init (cmEditor: CodeMirror.Editor): void {
    this.cmEditor = cmEditor
    const cmDoc = cmEditor.getDoc()

    this.collaborators.onJoin
      .subscribe((collab: Collaborator) => {
        this.cmCursors.set(collab.id, new CmCursor(cmDoc, collab.color))
    })

    this.collaborators.onLeave.subscribe((collab: Collaborator) => {
      const cursor = this.cmCursors.get(collab.id)
      if (cursor.cmBookmark !== null) {
        cursor.cmBookmark.clear()
      }
      cursor.stopClotting()
      this.cmCursors.delete(collab.id)
    })

    this.network.onMessage
      .subscribe((msg: NetworkMessage) => {
        if (msg.service === this.constructor.name) {
          const pbCursor = pb.Cursor.deserializeBinary(msg.content)
          const cursor = this.cmCursors.get(msg.id)
          if (cursor !== undefined) {
            let pos: any
            if (pbCursor.getContentCase() === pb.Cursor.ContentCase.VISIBLE) {
              if (pbCursor.getVisible()) {
                const lastLine = cmDoc.lastLine()
                pos = {line: lastLine, pos: cmDoc.getLine(lastLine).length}
              } else {
                cursor.hide()
                return
              }
            } else {
              const pbPosition = pbCursor.getPosition()
              const identifier = new Identifier(pbPosition.getBaseList(), pbPosition.getLast())
              pos = cmDoc.posFromIndex(this.doc.indexFromId(identifier) + pbPosition.getIndex())
            }
              const oldCoords = this.cmEditor.cursorCoords(cursor.cmBookmark.find(), 'local')
              const newCoords = this.cmEditor.cursorCoords(pos, 'local')
              cursor.translate({x: newCoords.left - oldCoords.left, y: newCoords.top - oldCoords.top})
              cursor.show()
              cursor.restartClotting()
          }
        }
    })

    const updateCursor = () => {
      const cursor: {index: number, last?: number, base?: number[]} =
        this.doc.idFromIndex(cmDoc.indexFromPos(cmDoc.getCursor()))
      if (cursor === null) {
        this.pbCursor.setVisible(true)
      } else {
        this.pbPosition.setIndex(cursor.index)
        this.pbPosition.setLast(cursor.last)
        this.pbPosition.setBaseList(cursor.base)
        this.pbCursor.setPosition(this.pbPosition)
      }
      this.network.newSend(this.constructor.name, this.pbCursor.serializeBinary())
    }

    CodeMirror.on(this.cmEditor, 'blur', () => {
      this.pbCursor.setVisible(false)
      this.network.newSend(this.constructor.name, this.pbCursor.serializeBinary())
      CodeMirror.off(cmDoc, 'cursorActivity', updateCursor)
    })

    CodeMirror.on(this.cmEditor, 'focus', () => {
      updateCursor()
      CodeMirror.on(cmDoc, 'cursorActivity', updateCursor)
    })
  }
}

class CmCursor {

  public domElm: HTMLElement
  public cmBookmark: any

  private clotIntervalID: number
  private clotTimeoutID: number

  constructor (cmDoc: CodeMirror.Doc, color: string) {
    this.domElm = document.createElement('span')
    this.cmBookmark = cmDoc.setBookmark({line: 0, ch: 0}, {widget: this.domElm})
    this.domElm.className = 'peerCursor'
    this.domElm.style.backgroundColor = color
    this.hide()
  }

  translate(coords) {
    this.domElm.style.transform = `translate(${Math.round(coords.x)}px, ${Math.round(coords.y)}px)`
  }

  restartClotting (): void {
    this.stopClotting()
    this.clotTimeoutID = window.setTimeout(() => {
      this.clotIntervalID = window.setInterval(() => {
        if (this.domElm.className.includes('clotted')) {
          this.domElm.className = this.domElm.className.replace(' clotted', '')
        } else {
          this.domElm.className += ' clotted'
        }
      }, 600)
   }, 400)
  }

  stopClotting (): void {
    this.domElm.className = this.domElm.className.replace(' clotted', '')
    window.clearInterval(this.clotIntervalID)
    window.clearTimeout(this.clotTimeoutID)
  }

  hide (): void {
    this.domElm.style.display = 'none'
    this.stopClotting()
  }

  show (): void {
    this.domElm.style.display = 'inline'
  }
}
