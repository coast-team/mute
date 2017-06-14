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

interface MuteCorePosition {
  index: number,
  last?: number,
  base?: number[]
}

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
  private pbFrom: any
  private pbTo: any

  constructor (
    private collabService: RichCollaboratorsService,
    private network: NetworkService
  ) {
    super('Cursor')
    this.pbCursor = new pb.Cursor()
    this.pbFrom = new pb.Position()
    this.pbTo = new pb.Position()
    this.cursors = new Map()
  }

  ngOnInit () {
    this.cmDoc = this.cm.getDoc()

    // When a new peer joins
    this.collabService.onJoin.subscribe((collab: RichCollaborator) => {
      this.cursors.set(collab.id, new CollaboratorCursor(this.cm, collab))
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
        cursor.updatePseudo(collab.pseudo)
      }
    })

    // When the editor looses the focus (my cursor disappeared)
    CodeMirror.on(this.cm, 'blur', () => {
      this.pbCursor.clearFrom()
      this.pbCursor.clearTo()
      this.pbCursor.setState(pb.State.HIDDEN)
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
          if (pbMsg.getState() === pb.State.HIDDEN) {
            // When cursor should be hidden

            cursor.hideCursor()
          } else if (pbMsg.getState() === pb.State.FROM) {
            // When cursor update only

            cursor.clearSelection()
            cursor.showCursor()
            let newPos: CodeMirror.Position
            if (pbMsg.hasFrom()) {
              const pbFrom = pbMsg.getFrom()
              const identifier = new Identifier(pbFrom.getBaseList(), pbFrom.getLast())
              newPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(identifier) + pbFrom.getIndex())
            } else {
              const lastLine = this.cmDoc.lastLine()
              newPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
            }
            cursor.translateCursorOnRemoteChange(newPos)
          } else {
            // When cursor & selection update

            let fromPos: CodeMirror.Position
            let toPos: CodeMirror.Position
            if (pbMsg.hasFrom()) {
              const pbFrom = pbMsg.getFrom()
              const identifier = new Identifier(pbFrom.getBaseList(), pbFrom.getLast())
              fromPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(identifier) + pbFrom.getIndex())
            } else {
              const lastLine = this.cmDoc.lastLine()
              fromPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
            }
            if (pbMsg.hasTo()) {
              const pbTo = pbMsg.getTo()
              const identifier = new Identifier(pbTo.getBaseList(), pbTo.getLast())
              toPos = this.cmDoc.posFromIndex(this.mcDocService.indexFromId(identifier) + pbTo.getIndex())
            } else {
              const lastLine = this.cmDoc.lastLine()
              toPos = { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
            }
            cursor.translateCursorOnRemoteChange(pbMsg.getState() === pb.State.SELECTION_FROM ? fromPos : toPos, false)
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
      const state = fromPos === cursorPos ? pb.State.SELECTION_FROM : pb.State.SELECTION_TO

      this.pbCursor.setState(state)

      // Retreive mute-core identifiers from codemirror positions
      const mcFromId: MuteCorePosition | null = this.mcDocService.idFromIndex(this.cmDoc.indexFromPos(fromPos))
      const mcToId: MuteCorePosition | null = this.mcDocService.idFromIndex(this.cmDoc.indexFromPos(toPos))

      // Started position for selection
      if (mcFromId === null) {
        this.pbCursor.clearFrom()
      } else {
        this.pbFrom.setIndex(mcFromId.index)
        this.pbFrom.setLast(mcFromId.last)
        this.pbFrom.setBaseList(mcFromId.base)
        this.pbCursor.setFrom(this.pbFrom)
      }

      // Ended position for selection
      if (mcToId === null) {
        this.pbCursor.clearTo()
      } else {
        this.pbTo.setIndex(mcToId.index)
        this.pbTo.setLast(mcToId.last)
        this.pbTo.setBaseList(mcToId.base)
        this.pbCursor.setTo(this.pbTo)
      }
    } else {

      // Prepare message for cursor only update
      this.pbCursor.setState(pb.State.FROM)
      this.pbCursor.clearTo()
      const id: MuteCorePosition | null = this.mcDocService.idFromIndex(this.cmDoc.indexFromPos(cursorPos))
      if (id === null) {
        this.pbCursor.clearFrom()
      } else {
        this.pbFrom.setIndex(id.index)
        this.pbFrom.setLast(id.last)
        this.pbFrom.setBaseList(id.base)
        this.pbCursor.setFrom(this.pbFrom)
      }
    }

    this.network.send(this.id, this.pbCursor.serializeBinary())
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
