import {
  Component,
  Injectable,
  Input,
  OnInit
} from '@angular/core'
import { MdButtonToggleModule } from '@angular/material'

import { EditorService } from '../editor.service'

@Component({
  selector: 'mute-style-yoolbar',
  templateUrl: './style-toolbar.component.html',
  styleUrls: ['./style-toolbar.component.scss'],
  providers: [ EditorService ]
})

@Injectable()
export class StyleToolbarComponent implements OnInit {

  @Input() cm: CodeMirror.Editor

  private toolbarWidth: number
  private toolbar: any

  constructor (
    private editorService: EditorService
  ) {}

  ngOnInit () {
    this.toolbar = document.getElementsByClassName('mute-style-toolbar')[0]
    this.toolbarWidth = this.removePx(getComputedStyle(this.toolbar).width)

    // Set up when to show/hide toolbar
    this.cm.on('cursorActivity', () => { this.showToolbar() })
    this.cm.on('mousedown', () => { this.hideToolbar() })
    // FIX ME: it disappear when it's clicked (check event.target)
    // this.cm.on('blur', () => { this.hideToolbar() })
  }

  hideToolbar (): void {
    this.toolbar.classList.remove('active')
    this.toolbar.classList.add('inactive')
  }

  showToolbar (): void {
    if (this.cm.getDoc().getSelection().length > 0) {
      this.setToolbarLocation()
      this.toolbar.classList.remove('inactive')
      this.toolbar.classList.add('active')
    }
  }

  setToolbarLocation (): void {
    const width: number = this.removePx(getComputedStyle(document.getElementsByTagName('mute-editor')[0] as any).borderLeft) // not ideal

    const top: number = this.getTopOfSelection()
    let left: number = this.getLeftFromMiddleOfSelection(top)
    let right: number = this.getRightFromMiddleOfSelection(top)

    let horizontalPosition = ''

    if (left < this.toolbarWidth / 2) {
      left = 0
      horizontalPosition = 'left: ' + left + 'px;'
    } else {
      if (right < width - this.toolbarWidth / 2) {
        right = 0
        horizontalPosition = 'right: ' + right + 'px;'
      } else {
        left -= this.toolbarWidth / 2
        horizontalPosition = 'left: ' + left + 'px;'
      }
    }
    this.toolbar.style = 'top: ' + top * this.cm.defaultTextHeight() + 'px; ' + horizontalPosition
  }

  // ACCESS PROPERTIES OF SELECTION
  getLeftFromMiddleOfSelection (line: number): number {
    let selection = this.cm.getDoc().listSelections()[0]
    let anchor = selection.anchor.ch
    let head = selection.head.ch
    let mean = anchor < head ? Math.floor((head - anchor) / 2) : Math.floor((anchor - head / 2))
    let leftBorderOfSelection = Math.min(anchor, head)
    let charCoords = this.cm.charCoords({line, ch: mean + leftBorderOfSelection}, 'window')
    return charCoords.left
  }

  getRightFromMiddleOfSelection (line: number): number {
    let selection = this.cm.getDoc().listSelections()[0]
    let anchor = selection.anchor.ch
    let head = selection.head.ch
    let mean = anchor < head ? Math.floor((head - anchor) / 2) : Math.floor((anchor - head / 2))
    let rightBorderOfSelection = Math.max(anchor, head)
    let charCoords = this.cm.charCoords({line, ch: mean + rightBorderOfSelection}, 'window')
    return charCoords.right
  }

  getTopOfSelection (): number {
    let selection = this.cm.getDoc().listSelections()[0]
    let anchor = selection.anchor.line
    let head = selection.head.line
    return Math.min(anchor, head)
  }

  // MD-BUTTON-TOGGLE FUNCTIONNALITIES
  toggleBold (): void {
    this.editorService.toggleStyle(this.cm, '**', {'**': new RegExp('[\\s\\S]*\\*\\*[\\s\\S]*\\*\\*[\\s\\S]*'),
      __: new RegExp('[\\s\\S]*__[\\s\\S]*__[\\s\\S]*')})
  }

  toggleItalic (): void {
    this.editorService.toggleStyle(this.cm, '_', {_: new RegExp('[^_]*(_|___)[^_][\\s\\S]*[^_](_|___)[^_]*', 'y'),
      '*': new RegExp('[^\\*]*(\\*|\\*\\*\\*)[^\\*][\\s\\S]*[^\\*](\\*|\\*\\*\\*)[^\\*]*', 'y')})
  }

  toggleStrikethrough (): void {
    this.editorService.toggleStyle(this.cm, '~~', {'~~': new RegExp('.*~~.*~~.*')})
  }

  // TOOLS
  removePx (cssSize: string): number {
    return +(cssSize.slice(0, -2))
  }

}
