import { Directive, Injectable, Input, OnChanges, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import * as CodeMirror from 'codemirror'
import { DocService, NetworkMessage } from 'mute-core'
import { TextDelete, TextInsert, Identifier } from 'mute-structs'

import { CollaboratorCursor } from './CollaboratorCursor'
import { RichCollaborator, RichCollaboratorsService } from '../../rich-collaborators/'
import { NetworkService } from '../../network/'
import { ServiceIdentifier } from '../../../helper/ServiceIdentifier'

const pb = require('./cursor_pb.js')

@Directive({
  selector: '[muteCursors]'
})

@Injectable()
export class CursorsDirective extends ServiceIdentifier implements OnInit, OnDestroy {

  @Input() cm: CodeMirror.Editor
  @Input() mcDocService: DocService

  private networkMsgSubs: Subscription

  private cmDoc: CodeMirror.Doc
  private cursors: Map<number, CollaboratorCursor> // CodeMirror cursors of other peers

  // Preconstructed Protocol Buffer objects for sending the position of my cursor
  private pbCursor: any
  private pbPosition: any

  constructor (
    private collabService: RichCollaboratorsService,
    private network: NetworkService
  ) {
    super('Cursor')
    this.cursors = new Map()
    this.pbPosition = new pb.Position()
    this.pbCursor = new pb.Cursor()
  }

  ngOnInit () {
    this.cmDoc = this.cm.getDoc()

    // When a new peer joins
    this.collabService.onJoin.subscribe((collab: RichCollaborator) => {
      this.cursors.set(collab.id, new CollaboratorCursor(this.cm, collab.color))
    })

    // When the peer leaves
    this.collabService.onLeave.subscribe((id: number) => {
      const cursor = this.cursors.get(id)
      if (cursor !== undefined) {
        cursor.clear()
        this.cursors.delete(id)
      }
    })

    // When the editor looses the focus (my cursor disappeared)
    CodeMirror.on(this.cm, 'blur', () => {
      this.pbCursor.setVisible(false)
      this.network.send(this.id, this.pbCursor.serializeBinary())
    })

    // Send my cursor position to the network on certain events
    this.listenEventsForCursorChange()

    // On message from the network
    this.networkMsgSubs = this.network.onMessage
      .filter((msg: NetworkMessage) => msg.service === this.id)
      .subscribe((msg: NetworkMessage) => {
        const pbMsg = pb.Cursor.deserializeBinary(msg.content)
        const cursor = this.cursors.get(msg.id)
        if (cursor !== undefined) {
          let newPos: CodeMirror.Position
          switch (pbMsg.getContentCase()) {
            case pb.Cursor.ContentCase.VISIBLE:
              if (pbMsg.getVisible()) {
                const lastLine = this.cmDoc.lastLine()
                newPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
                cursor.show()
              } else {
                cursor.hide()
                return
              }
              break
            case pb.Cursor.ContentCase.POSITION:
              cursor.show()
              const pbPosition = pbMsg.getPosition()
              const identifier = new Identifier(pbPosition.getBaseList(), pbPosition.getLast())
              newPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(identifier) + pbPosition.getIndex())
              break
          }
          cursor.translate(newPos)
        }
      })
  }

  ngOnDestroy () {
    this.networkMsgSubs.unsubscribe()
  }

  isMovementKey (keyCode) {
    return 33 <= keyCode && keyCode <= 40
  }

  sendMyCursorPos = () => {
    const cursor: { index: number, last?: number, base?: number[] } | null =
      this.mcDocService.idFromIndex(this.cmDoc.indexFromPos(this.cmDoc.getCursor()))
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

  listenEventsForCursorChange () {
    let movedByMouse = false

    CodeMirror.on(this.cm, 'keyup', (instance: CodeMirror.Editor, event: KeyboardEvent) => {
      if (this.isMovementKey(event.keyCode)) {
        this.sendMyCursorPos()
      }
    })

    CodeMirror.on(this.cm, 'mousedown', () => {
      movedByMouse = true
    })

    CodeMirror.on(this.cm, 'cursorActivity', (instance: CodeMirror.Editor, event: KeyboardEvent) => {
      if (movedByMouse) {
        movedByMouse = false
        if (!this.cmDoc.getSelection()) {
          this.sendMyCursorPos()
        }
      }
      // this.sendMyCursorPos()
    })

    // Fixme: bind this event after first sync, otherwise its called many unnecessary times
    CodeMirror.on(this.cm, 'change', (instance: CodeMirror.Editor, changeObj: any) => {
      this.cursors.forEach((cursor) => {
        cursor.update(changeObj.text.length, changeObj.text[0].length)
      })
    })

    CodeMirror.on(this.cm, 'keydown', (instance, event: KeyboardEvent) => {
      if (this.isMovementKey(event.keyCode)) {
        movedByMouse = false
      }
    })

    CodeMirror.on(this.cm, 'beforeChange', () => { movedByMouse = false })

    CodeMirror.on(this.cm, 'touchstart', () => { movedByMouse = true })
  }
}
