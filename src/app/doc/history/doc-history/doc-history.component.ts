import { Component, OnInit, Injectable, Input, ViewChild } from '@angular/core'
import { DocService } from 'mute-core/lib'
import * as CodeMirror from 'codemirror'

require('codemirror/mode/gfm/gfm')
require('codemirror/mode/javascript/javascript')

@Component({
  selector: 'mute-doc-history',
  templateUrl: './doc-history.component.html',
  styleUrls: ['./doc-history.component.scss'],
  providers: []
})

@Injectable()
export class DocHistoryComponent implements OnInit {

  private isInited = false

  @Input() docService: DocService
  @ViewChild('editorElt') editorElt


  public editor: CodeMirror.Editor

  constructor () { }

  ngOnInit () {
    this.editor = CodeMirror(document.getElementById('textArea'), {
      value: 'this is a sample text',
      mode: 'gfm',
      readOnly: 'true'
    })
  }
}
