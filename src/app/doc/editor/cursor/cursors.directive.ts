import { Directive, Injectable, Input, OnDestroy, OnInit } from '@angular/core'
import * as CodeMirror from 'codemirror'
import { DocService, NetworkMessage, Position } from 'mute-core'
import { Identifier } from 'mute-structs'
import { filter } from 'rxjs/operators'
import { Subscription } from 'rxjs/Subscription'

import { NetworkService } from '../../network/'
import { RichCollaborator, RichCollaboratorsService } from '../../rich-collaborators/'
import { CollaboratorCursor } from './CollaboratorCursor'
import * as proto from './cursor_pb'

@Directive({
  selector: '[muteCursors]'
})

@Injectable()
export class CursorsDirective implements OnInit, OnDestroy {

  @Input() cm: CodeMirror.Editor
  @Input() mcDocService: DocService

  private subs: Subscription[]
  private cursorPosAfterBlur: CodeMirror.Position

  private cmDoc: CodeMirror.Doc
  private cursors: Map<number, CollaboratorCursor> // CodeMirror cursors of other peers

  // Preconstructed Protocol Buffer objects for sending the position of my cursor
  private protoCursor: proto.Cursor
  private protoAnchor: proto.Position
  private protoHead: proto.Position

  protected id: string

  constructor (
    private collabService: RichCollaboratorsService,
    private network: NetworkService
  ) {
    this.id = 'Cursor'
    this.protoCursor = proto.Cursor.create()
    this.protoAnchor = proto.Position.create()
    this.protoHead = proto.Position.create()
    this.cursors = new Map()
    this.subs = []
  }

  ngOnInit () {
    this.cmDoc = this.cm.getDoc()

    // When a new peer joins
    this.subs[this.subs.length] = this.collabService.onJoin.subscribe((collab: RichCollaborator) => {
      this.cursors.set(collab.id, new CollaboratorCursor(this.cm, collab))
      if (this.cm.hasFocus()) {
        this.sendMyCursorPos()
      }
    })

    // When the peer leaves
    this.subs[this.subs.length] = this.collabService.onLeave.subscribe((id: number) => {
      const cursor = this.cursors.get(id)
      if (cursor !== undefined) {
        cursor.clean()
        this.cursors.delete(id)
      }
    })

    // When the peer changes his pseudo
    this.subs[this.subs.length] = this.collabService.onChange.subscribe(({collab}: {collab: RichCollaborator}) => {
      const cursor = this.cursors.get(collab.id)
      if (cursor !== undefined) {
        cursor.updateDisplayName(collab.pseudo)
      }
    })

    CodeMirror.on(this.cm, 'blur', () => {
      this.protoCursor.anchor = undefined
      this.protoCursor.head = undefined
      this.network.send(this.id, proto.Cursor.encode(this.protoCursor).finish())
      this.cursorPosAfterBlur = this.cmDoc.getCursor('head')
    })

    CodeMirror.on(this.cm, 'focus', () => {
      const head = this.cmDoc.getCursor('head')
      if (this.cursorPosAfterBlur && this.cursorPosAfterBlur.line === head.line && this.cursorPosAfterBlur.ch === head.ch) {
        this.sendMyCursorPos()
      }
    })
    // Send my cursor position to the network on certain events
    this.listenEventsForCursorChange()

    // On message from the network
    this.subs[this.subs.length] = this.network.onMessage
      .pipe(filter((msg: NetworkMessage) => msg.service === this.id))
      .subscribe((msg: NetworkMessage) => {
        const protoCursor = proto.Cursor.decode(msg.content)
        const cursor = this.cursors.get(msg.id)
        if (cursor) {
          if (protoCursor.head) {
            const headPos = this.protoPos2codemirrorPos(protoCursor.head)
            if (protoCursor.anchor) {
              const anchorPos = this.protoPos2codemirrorPos(protoCursor.anchor)
              cursor.updateSelection(anchorPos, headPos)
            } else {
              cursor.removeSelection()
              cursor.updateCursor(headPos)
            }
          } else {
            cursor.removeCursor()
          }
        }
      })
  }

  ngOnDestroy () {
    this.subs.forEach((sub) => sub.unsubscribe())
  }

  private protoPos2codemirrorPos (pos: proto.IPosition): CodeMirror.Position {
    if (pos.id) {
      const id = Identifier.fromPlain(pos.id)
      return this.cmDoc.posFromIndex(this.mcDocService.indexFromId(id) + pos.index)
    } else {
      const lastLine = this.cmDoc.lastLine()
      return { line: lastLine, ch: this.cmDoc.getLine(lastLine).length }
    }
  }

  private sendMyCursorPos () {
    const anchor = this.cmDoc.getCursor('anchor')
    const head = this.cmDoc.getCursor('head')

    if (head.line !== anchor.line || head.ch !== anchor.ch) {
      // Update anchor position of the selection
      const muteCoreAnchor: Position | null = this.mcDocService.positionFromIndex(this.cmDoc.indexFromPos(anchor))
      if (muteCoreAnchor) {
        this.protoAnchor.id = muteCoreAnchor.id
        this.protoAnchor.index = muteCoreAnchor.index
      } else {
        // End of the document
        this.protoAnchor.id = undefined
        this.protoAnchor.index = undefined
      }
      this.protoCursor.anchor = this.protoAnchor
    } else {
      // There is no selection, cursor update only
      this.protoCursor.anchor = undefined
    }

    // Update cursor position
    const muteCoreHead: Position | null = this.mcDocService.positionFromIndex(this.cmDoc.indexFromPos(head))
    if (muteCoreHead) {
      this.protoHead.id = muteCoreHead.id
      this.protoHead.index = muteCoreHead.index
      this.protoCursor.head = this.protoHead
    } else {
        // End of the document
      this.protoHead.id = undefined
      this.protoHead.index = undefined
    }
    this.protoCursor.head = this.protoHead

    // Broadcast my cursor/selection position
    this.network.send(this.id, proto.Cursor.encode(this.protoCursor).finish())
  }

  private listenEventsForCursorChange () {
    let cursorShouldBeSent = false

    CodeMirror.on(this.cm, 'cursorActivity', (instance: CodeMirror.Editor) => {
      if (cursorShouldBeSent) {
        this.sendMyCursorPos()
      }
    })

    CodeMirror.on(this.cm, 'keydown', (instance, event: KeyboardEvent) => {
      // Cursor should be sent if the key is one that moves the cursor (arrow keys for example)
      cursorShouldBeSent = 33 <= event.keyCode && event.keyCode <= 40
    })
    CodeMirror.on(this.cm, 'mousedown', () => cursorShouldBeSent = true)

    CodeMirror.on(this.cm, 'touchstart', () => { cursorShouldBeSent = true })

    CodeMirror.on(this.cm, 'keyHandled', (instance: CodeMirror.Editor, name: string, event: Event) => {
      // check whether all text were selected
      const anchor = this.cmDoc.getCursor('anchor')
      const head = this.cmDoc.getCursor('head')
      if (anchor.line !== head.line || anchor.ch !== head.ch) {
        this.sendMyCursorPos()
      }
    })
  }
}
