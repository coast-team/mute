import { Component, Injectable, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import * as CodeMirror from 'codemirror'
// FIXME: Find a proper way to import the mode's files
require('codemirror/mode/gfm/gfm')
require('codemirror/mode/javascript/javascript')
import { TextDelete, TextInsert }  from 'mute-structs'

import { EditorService } from './editor.service'
import { DocService } from 'mute-core'

@Component({
  selector: 'mute-editor',
  templateUrl: './editor.component.html',
  styleUrls: [
    // FIXME: Importing CodeMirror's CSS here doesn't work.
    // Should find a proper way to do it.
    './editor.component.scss'
  ],
  providers: []
})

@Injectable()
export class EditorComponent implements OnDestroy, OnInit {

  private editor: CodeMirror.Editor

  private docValueSubscription: Subscription
  private remoteOperationsSubscription: Subscription
  private localOperationsSubscription: Subscription

  @Input() docService: DocService
  @ViewChild('editorElt') editorElt

  public innerWidth = window.innerWidth

  constructor (
    private editorService: EditorService
  ) {}

  ngOnInit () {
    this.editor = CodeMirror.fromTextArea(this.editorElt.nativeElement, {
      lineNumbers: false,
      lineWrapping: true,
      autofocus: false,
      mode: {name: 'gfm', globalVars: true}
    })

    const operationStream: Observable<ChangeEvent> = Observable.fromEventPattern(
      (h: ChangeEventHandler) => {
        this.editor.on('change', h)
      },
      (h: ChangeEventHandler) => {
        this.editor.off('change', h)
      },
      (instance: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
        return new ChangeEvent(instance, change)
      })
      .filter((changeEvent: ChangeEvent) => {
        // The change's origin indicates the kind of changes performed
        // When the application updates the editor programatically, this field remains undefined
        // Allow to filter the changes performed by our application
        return changeEvent.change.origin !== undefined && changeEvent.change.origin !== 'setValue'
      })

    const multipleOperationsStream: Observable<ChangeEvent[]> = operationStream
      .map((changeEvent: ChangeEvent) => {
        return [changeEvent]
      })
      /*
      .bufferTime(1000)
      .filter((changeEvents: ChangeEvent[]) => {
        // From time to time, the buffer returns an empty array
        // Allow to filter these cases
        return changeEvents.length > 0
      })
      */

    const textOperationsStream: Observable<(TextDelete | TextInsert)[][]> = multipleOperationsStream.map( (changeEvents: ChangeEvent[]) => {
      return changeEvents.map( (changeEvent: ChangeEvent ) => {
        return changeEvent.toTextOperations()
      })
    })

    this.localOperationsSubscription = textOperationsStream.subscribe((textOperations: (TextDelete | TextInsert)[][]) => {
      this.editorService.emitLocalTextOperations(textOperations)
    })

    this.docValueSubscription = this.docService.onDocValue.subscribe( (str: string) => {
      this.editor.setValue(str)
    })

    // multipleOperationsStream.subscribe(
    //   (changeEvents: ChangeEvent[]) => {
    //     console.log(`${changeEvents.length} operations:`)
    //     changeEvents.forEach((changeEvent: ChangeEvent) => {
    //       console.log(changeEvent.instance)
    //       console.log(changeEvent.change)
    //     })
    //   })

    this.remoteOperationsSubscription = this.docService.onRemoteTextOperations.subscribe( (textOperations: any[]) => {
      const doc: CodeMirror.Doc = this.editor.getDoc()

      log.info('operation:editor', 'applied: ', textOperations)

      textOperations.forEach( (textOperation: any) => {
        const from: CodeMirror.Position = doc.posFromIndex(textOperation.offset)
        if (textOperation instanceof TextInsert) {
          doc.replaceRange(textOperation.content, from)
        } else if (textOperation instanceof TextDelete) {
          const to: CodeMirror.Position = doc.posFromIndex(textOperation.offset + textOperation.length)
          doc.replaceRange('', from, to)
        }
      })
    })
  }

  ngOnDestroy () {
    this.docValueSubscription.unsubscribe()
    this.localOperationsSubscription.unsubscribe()
    this.remoteOperationsSubscription.unsubscribe()
  }

  focus () {
    this.editor.focus()
  }
}

type ChangeEventHandler = (instance: CodeMirror.Editor, change: CodeMirror.EditorChange) => void

class ChangeEvent {
  instance: CodeMirror.Editor
  change: CodeMirror.EditorChange

  constructor (instance: CodeMirror.Editor, change: CodeMirror.EditorChange) {
    this.instance = instance
    this.change = change
  }

  toTextOperations (): (TextDelete | TextInsert)[] {
    const textOperations: (TextDelete | TextInsert)[] = []
    const pos: CodeMirror.Position = this.change.from
    const index: number = this.instance.getDoc().indexFromPos(pos)

    // Some changes should be translated into both a TextDelete and a TextInsert operations
    // It's especially the case when the changes replace a character
    if (this.isDeleteOperation()) {
      const length: number = this.change.removed.join('\n').length
      textOperations.push(new TextDelete(index, length))
    }
    if (this.isInsertOperation()) {
      const text: string = this.change.text.join('\n')
      textOperations.push(new TextInsert(index, text))
    }

    log.info('operation:editor', 'generated: ', textOperations)
    return textOperations
  }

  isInsertOperation (): boolean {
    return this.change.text.length > 1 || this.change.text[0].length > 0
  }

  isDeleteOperation (): boolean {
    return this.change.removed.length > 1 || this.change.removed[0].length > 0
  }
}
