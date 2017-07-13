import {
  Component,
  Injectable,
  Input,
  OnInit
} from '@angular/core'
import { MdButtonToggleModule, MdTooltipModule } from '@angular/material'

import { EditorService } from '../editor.service'

@Component({
  selector: 'mute-style-toolbar',
  templateUrl: './style-toolbar.component.html',
  styleUrls: ['./style-toolbar.component.scss'],
  providers: [ EditorService ]
})

@Injectable()
export class StyleToolbarComponent implements OnInit {

  @Input() cm: CodeMirror.Editor

  private buttons: Array<any> = new Array()
  private toolbarWidth: number
  private toolbar: any

  constructor (
    private editorService: EditorService
  ) {}

  ngOnInit () {
    this.toolbar = document.getElementsByClassName('mute-style-toolbar')[0]
    this.getButtons()
    this.toolbarWidth = this.removePx(getComputedStyle(this.toolbar).width)

    // Set up when to show/hide toolbar
    // As it runs even when the selection is not complete, maybe is needs to create a custom CodeMirror event
    this.cm.on('cursorActivity', () => { this.showToolbar() })
    this.cm.on('mousedown', () => { this.hideToolbar() })
    // FIX ME: it disappears when it's clicked (check event.target)
    // this.cm.on('blur', () => { this.hideToolbar() })
  }

  hideToolbar (): void {
    this.resetToggledButtons()
    this.toolbar.classList.remove('active')
    this.toolbar.classList.add('inactive')
  }

  showToolbar (): void {
    if (this.cm.getDoc().somethingSelected()) {
      this.setToggledButtons()
      this.setToolbarLocation()
      this.toolbar.classList.remove('inactive')
      this.toolbar.classList.add('active')
    }
  }

  // SET TOOLBAR UP
  // Find via DOM and CodeMirror state which style a selection has, so the related buttons be toggled
  setToggledButtons (): void {

  }

  setToolbarLocation (): void {
    const width: number = this.removePx(getComputedStyle(document.getElementsByTagName('mute-editor')[0] as any).borderLeft) // not ideal

    const line: number = this.getUpperLine()
    let top: number = this.getTopFromSelection(line)
    let left: number = this.getLeftFromMiddleOfSelection(line)
    let right: number = this.getRightFromMiddleOfSelection(line)

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
    this.toolbar.style = 'top: ' + top + 'px; ' + horizontalPosition
  }

  resetToggledButtons (): void {
    this.buttons.forEach(function (button) {
      if (button.classList.contains('mat-button-toggle-checked')) {
        button.classList.remove('mat-button-toggle-checked')
      }
    })
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

  getTopFromSelection (line: number): number {
    let charCoords = this.cm.charCoords({line, ch: 0}, 'local')
    return charCoords.top - 8
  }

  getUpperLine (): number {
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

  createQuotation (): void {
    this.cm.getDoc().replaceSelection('>' + this.cm.getDoc().getSelection())
  }

  addHeader (headerSize: string): void {
    switch (+(headerSize)) {
    case 1:
      headerSize = '# '
      break
    case 2:
      headerSize = '## '
      break
    case 3:
      headerSize = '### '
      break
    case 4:
      headerSize = '#### '
      break
    case 5:
      headerSize = '##### '
      break
    }
    this.cm.getDoc().replaceSelection(headerSize + this.cm.getDoc().getSelection())
  }

  // TOOLS
  getButtons (): void {
    this.buttons.push(this.toolbar.childNodes[1])
    this.buttons.push(this.toolbar.childNodes[3])
    this.buttons.push(this.toolbar.childNodes[5])
    this.buttons.push(this.toolbar.childNodes[7])
    this.buttons.push(this.toolbar.childNodes[9])
  }

  removePx (cssSize: string): number {
    return +(cssSize.slice(0, -2))
  }

}
