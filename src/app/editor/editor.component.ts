import { Component, Injectable, OnInit, ViewChild } from '@angular/core'
import { Observable } from 'rxjs'
import * as CodeMirror from 'codemirror'

import { LoggerService } from '../core/logger.service'
import { NetworkService } from '../core/network/network.service'

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

  private editor: CodeMirror.Editor

  @ViewChild('editorElt') editorElt

  constructor(
    private loggerService: LoggerService,
    private network: NetworkService
  ) {
    this.loggerService = loggerService
  }

  ngOnInit() {
    this.editor = CodeMirror.fromTextArea(this.editorElt.nativeElement, {
      lineNumbers: false,
      lineWrapping: true,
      mode: {name: 'javascript', globalVars: true}
    })

    let peerCursor = document.createElement('span')
    peerCursor.className = 'peerCursor'
    setInterval(() => {
      if (peerCursor.className.includes('clotted')) {
        peerCursor.className = 'peerCursor'
      } else {
        peerCursor.className += ' clotted'
      }
    }, 600)
    this.editor.getDoc().setBookmark({line: 2, ch: 30}, {widget: peerCursor})

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

    operationStream.subscribe((changeEvent: ChangeEvent) => {
      this.network.send(JSON.stringify(changeEvent.change))
    })

    const multipleOperationsStream: Observable<ChangeEvent[]> = operationStream
      .bufferTime(1000)
      .filter((changeEvents: ChangeEvent[]) => {
        return changeEvents.length > 0
      })

    // multipleOperationsStream.subscribe(
    //   (changeEvents: ChangeEvent[]) => {
    //     console.log(`${changeEvents.length} operations:`)
    //     changeEvents.forEach((changeEvent: ChangeEvent) => {
    //       console.log(changeEvent.instance)
    //       console.log(changeEvent.change)
    //     })
    //   })
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
