import { Component, Injectable, OnInit, ViewChild } from '@angular/core'
import { Observable } from 'rxjs'

import { LoggerService } from '../core/logger.service'
import * as CodeMirror from 'codemirror'

@Component({
  selector: 'mute-editor',
  templateUrl: './editor.component.html',
  styleUrls: [
    // FIXME: Importing CodeMirror's CSS here doesn't work.
    // Should find a proper way to do it.
    './editor.component.css'
  ]
})

@Injectable()
export class EditorComponent implements OnInit {

  private loggerService: LoggerService
  private editor: CodeMirror.Editor

  @ViewChild('editorElt') editorElt

  constructor(loggerService: LoggerService) {
    this.loggerService = loggerService
  }

  ngOnInit() {
    this.editor = CodeMirror.fromTextArea(this.editorElt.nativeElement, {lineNumbers: true, mode: {name: 'javascript', globalVars: true}})

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

    const multipleOperationsStream: Observable<ChangeEvent[]> = operationStream
      .bufferTime(1000)
      .filter((changeEvents: ChangeEvent[]) => {
        return changeEvents.length > 0
      })

    multipleOperationsStream.subscribe(
      (changeEvents: ChangeEvent[]) => {
        console.log(`${changeEvents.length} operations:`)
        changeEvents.forEach((changeEvent: ChangeEvent) => {
          console.log(changeEvent.instance)
          console.log(changeEvent.change)
        })
      })
  }
}

type ChangeEventHandler = (instance: CodeMirror.Editor, change: CodeMirror.EditorChange) => void

class ChangeEvent {
  instance: CodeMirror.Editor
  change: CodeMirror.EditorChange

  constructor(instance: CodeMirror.Editor, change: CodeMirror.EditorChange) {
    this.instance = instance
    this.change = change
  }
}
