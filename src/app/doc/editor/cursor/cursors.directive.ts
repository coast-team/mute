import { Directive, Injectable, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { RichCollaborator, RichCollaboratorsService } from '../../rich-collaborators/'
import { NetworkService } from '../../network/'
import { ServiceIdentifier } from '../../../helper/ServiceIdentifier'

import { Subscription } from 'rxjs'

import * as CodeMirror from 'codemirror'
import { DocService, NetworkMessage } from 'mute-core'
import { Identifier } from 'mute-structs'

const pb = require('./cursor_pb.js')

@Injectable() @Directive({ selector: '[muteCursors]' })
export class CursorsDirective extends ServiceIdentifier implements OnChanges, OnInit {

  @Input() cmEditor: CodeMirror.Editor
  @Input() docService: DocService

  private messageSubscription: Subscription

  private cmCursors: Map<number, CmCursor> // CodeMirror cursors of other peers
  private isInited = false
  private pbCursor: any
  private pbPosition: any // My cursor

  constructor (
    private collabService: RichCollaboratorsService,
    private network: NetworkService
  ) {
    super('Cursor')
    this.cmCursors = new Map()
    this.pbPosition = new pb.Position()
    this.pbCursor = new pb.Cursor()
  }

  ngOnInit () {
    const cmDoc: CodeMirror.Doc = this.cmEditor.getDoc()

    this.collabService.onJoin.subscribe((colab: RichCollaborator) => {
      this.cmCursors.set(colab.id, new CmCursor(cmDoc, colab.color))
    })

    this.collabService.onLeave.subscribe((id: number) => {
      const cursor: CmCursor | undefined = this.cmCursors.get(id)
      if (cursor !== undefined) {
        if (cursor.cmBookmark !== null) {
          cursor.cmBookmark.clear()
        }
        cursor.stopClotting()
        this.cmCursors.delete(id)
      }
    })

    const updateCursor = (): void => {
      const cursor: {index: number, last?: number, base?: number[]} | null =
        this.docService.idFromIndex(cmDoc.indexFromPos(cmDoc.getCursor()))
      if (cursor === null) {
        this.pbCursor.setVisible(true)
      } else {
        this.pbPosition.setIndex(cursor.index)
        this.pbPosition.setLast(cursor.last)
        this.pbPosition.setBaseList(cursor.base)
        this.pbCursor.setPosition(this.pbPosition)
      }
      this.network.send(this.id, this.pbCursor.serializeBinary())
    }

    CodeMirror.on(this.cmEditor, 'blur', () => {
      this.pbCursor.setVisible(false)
      this.network.send(this.id, this.pbCursor.serializeBinary())
      CodeMirror.off(cmDoc, 'cursorActivity', updateCursor)
    })

    CodeMirror.on(this.cmEditor, 'focus', () => {
      updateCursor()
      CodeMirror.on(cmDoc, 'cursorActivity', updateCursor)
    })
  }

  ngOnChanges (changes: SimpleChanges): void {
    const cmDoc: CodeMirror.Doc = this.cmEditor.getDoc()

    if (this.isInited) {
      this.messageSubscription.unsubscribe()
    }

    this.messageSubscription = this.network.onMessage
      .filter((msg: NetworkMessage) => msg.service === this.id)
      .subscribe((msg: NetworkMessage) => {
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
            pos = cmDoc.posFromIndex(this.docService.indexFromId(identifier) + pbPosition.getIndex())
          }
          const oldCoords = this.cmEditor.cursorCoords(cursor.cmBookmark.find(), 'local')
          const newCoords = this.cmEditor.cursorCoords(pos, 'local')
          cursor.translate({x: newCoords.left - oldCoords.left, y: newCoords.top - oldCoords.top})
          cursor.show()
          cursor.restartClotting()
        }
      })

    this.isInited = true
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

  translate (coords) {
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
