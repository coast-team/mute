import { Directive, Injectable, Input, OnDestroy, OnInit } from '@angular/core'
import * as CodeMirror from 'codemirror'
import { DocService, NetworkMessage, Position } from 'mute-core'
import { Identifier } from 'mute-structs'
import { Subscription } from 'rxjs/Subscription'

import { ServiceIdentifier } from '../../../helper/ServiceIdentifier'
import { NetworkService } from '../../network/'
import { RichCollaborator, RichCollaboratorsService } from '../../rich-collaborators/'
import { CollaboratorCursor } from './CollaboratorCursor'
import { CursorMsg, PositionMsg, State } from './cursor_pb'

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
  private pbCursor: CursorMsg
  private pbFrom: PositionMsg
  private pbTo: PositionMsg

  constructor (
    private collabService: RichCollaboratorsService,
    private network: NetworkService
  ) {
    super('Cursor')
    this.pbCursor = CursorMsg.create()
    this.pbFrom = PositionMsg.create()
    this.pbTo = PositionMsg.create()
    this.cursors = new Map()
  }

  ngOnInit () {
    this.cmDoc = this.cm.getDoc()

    // When a new peer joins
    this.collabService.onJoin.subscribe((collab: RichCollaborator) => {
      this.cursors.set(collab.id, new CollaboratorCursor(this.cm, collab))
      if (this.cm.hasFocus()) {
        this.sendMyCursorPos()
      }
    })

    // When the peer leaves
    this.collabService.onLeave.subscribe((id: number) => {
      const cursor = this.cursors.get(id)
      if (cursor !== undefined) {
        cursor.clearAll()
        this.cursors.delete(id)
      }
    })

    // When the peer changes his pseudo
    this.collabService.onChange.subscribe(({collab}: {collab: RichCollaborator}) => {
      const cursor = this.cursors.get(collab.id)
      if (cursor !== undefined) {
        cursor.updateDisplayName(collab.pseudo)
      }
    })

    // When the editor looses the focus (my cursor disappeared)
    CodeMirror.on(this.cm, 'blur', () => {
      this.pbCursor.from = undefined
      this.pbCursor.to = undefined
      this.pbCursor.state = State.HIDDEN
      this.network.send(this.id, CursorMsg.encode(this.pbCursor).finish())
    })

    CodeMirror.on(this.cm, 'focus', () => {
      this.sendMyCursorPos()
    })

    // Send my cursor position to the network on certain events
    this.listenEventsForCursorChange()

    // On message from the network
    this.networkMsgSubs = this.network.onMessage
      .filter((msg: NetworkMessage) => msg.service === this.id)
      .subscribe((msg: NetworkMessage) => {
        const pbMsg = CursorMsg.decode(msg.content)
        const cursor = this.cursors.get(msg.id)
        if (cursor !== undefined) {
          if (pbMsg.state === State.HIDDEN) {
            // When cursor should be hidden
            cursor.hideCursor()

          } else if (pbMsg.state === State.FROM) {
            // When cursor update only
            cursor.clearSelection()
            cursor.showCursor()
            let newPos: CodeMirror.Position
            if (pbMsg.from) {
              const pbFrom = pbMsg.from
              const id = Identifier.fromPlain(pbFrom.id)
              newPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(id) + pbFrom.index)
            } else {
              const lastLine = this.cmDoc.lastLine()
              newPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
            }
            cursor.translateCursorOnRemoteChange(newPos)

          } else {
            // When cursor & selection update
            let fromPos: CodeMirror.Position
            let toPos: CodeMirror.Position
            if (pbMsg.from) {
              const pbFrom = pbMsg.from
              const id = Identifier.fromPlain(pbFrom.id)
              fromPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(id) + pbFrom.index)
            } else {
              const lastLine = this.cmDoc.lastLine()
              fromPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
            }
            if (pbMsg.to) {
              const pbTo = pbMsg.to
              const id = Identifier.fromPlain(pbTo.id)
              toPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(id) + pbTo.index)
            } else {
              const lastLine = this.cmDoc.lastLine()
              toPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
            }
            cursor.translateCursorOnRemoteChange(pbMsg.state === State.SELECTION_FROM ? fromPos : toPos, false)
            cursor.updateSelection(fromPos, toPos)
          }
        }
      })
  }

  ngOnDestroy () {
    this.networkMsgSubs.unsubscribe()
  }

  isMovementKey (keyCode) {
    return 33 <= keyCode && keyCode <= 40
  }

  sendMyCursorPos (isSelection = false) {
    const cursorPos = this.cmDoc.getCursor()
    if (isSelection) {

      // Prepare messag for cursor and selection update
      const fromPos = this.cmDoc.getCursor('from')
      const toPos = this.cmDoc.getCursor('to')
      const state = fromPos === cursorPos ? State.SELECTION_FROM : State.SELECTION_TO

      this.pbCursor.state = state

      // Retreive mute-core identifiers from codemirror positions
      const mcFromPos: Position | null = this.mcDocService.positionFromIndex(this.cmDoc.indexFromPos(fromPos))
      const mcToPos: Position | null = this.mcDocService.positionFromIndex(this.cmDoc.indexFromPos(toPos))

      // Started position for selection
      if (mcFromPos !== null) {
        this.pbFrom.id = mcFromPos.id
        this.pbFrom.index = mcFromPos.index
        this.pbCursor.from = this.pbFrom
      } else {
        this.pbCursor.from = undefined
      }

      // Ended position for selection
      if (mcToPos !== null) {
        this.pbTo.id = mcToPos.id
        this.pbTo.index = mcToPos.index
        this.pbCursor.to = this.pbTo
      } else {
        this.pbCursor.to = undefined
      }
    } else {

      // Prepare message for cursor only update
      this.pbCursor.state = State.FROM
      const pos: Position | null = this.mcDocService.positionFromIndex(this.cmDoc.indexFromPos(cursorPos))
      if (pos !== null) {
        this.pbFrom.id = pos.id
        this.pbFrom.index = pos.index
        this.pbCursor.from = this.pbFrom
      } else {
        this.pbCursor.from = undefined
      }
    }

    this.network.send(this.id, CursorMsg.encode(this.pbCursor).finish())
  }

  listenEventsForCursorChange () {
    let movedByMouse = false

    CodeMirror.on(this.cm, 'keyup', (instance: CodeMirror.Editor, event: KeyboardEvent) => {
      if (this.isMovementKey(event.keyCode)) {
        this.sendMyCursorPos(this.cmDoc.getSelection() !== '')
      }
    })

    CodeMirror.on(this.cm, 'mousedown', () => { movedByMouse = true })

    CodeMirror.on(this.cm, 'cursorActivity', (instance: CodeMirror.Editor) => {
      const selection = this.cmDoc.getSelection()
      if (movedByMouse) {
        movedByMouse = false
        if (!selection) {
          this.sendMyCursorPos()
        }
      }
      if (selection) {
        this.sendMyCursorPos(true)
      }
    })

    // Fixme: bind this event after first sync, otherwise its called many unnecessary times
    CodeMirror.on(this.cm, 'change', (instance: CodeMirror.Editor, changeObj: any) => {
      this.cursors.forEach((cursor) => {
        cursor.translateCursorOnLocalChange(changeObj.text.length, changeObj.text[0].length)
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
