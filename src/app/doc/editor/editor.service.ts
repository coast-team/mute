import {
  Injectable
} from '@angular/core'
import CodeMirror from 'codemirror'
// SETTINGS: Thoses imports below are needed to run HyperMd into Mute
import 'codemirror/addon/mode/overlay'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/mode/meta'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/javascript/javascript'
import 'hypermd/hypermd/mode/hypermd.js'
import 'hypermd/hypermd/addon/hide-token'
import 'hypermd/hypermd/addon/cursor-debounce'
import 'hypermd/hypermd/addon/fold'
// SETTING: The 4 imports below load a particular configuration for using fold-math
// See others configurations here: http://docs.mathjax.org/en/latest/config-files.html#common-configurations
import 'mathjax/MathJax.js'
import 'mathjax/config/TeX-AMS_CHTML.js'
import 'mathjax/jax/output/CommonHTML/jax.js'
import 'mathjax/jax/output/CommonHTML/fonts/TeX/fontdata.js'
import 'hypermd/hypermd/addon/fold-math'
import 'hypermd/hypermd/addon/readlink'
import 'hypermd/hypermd/addon/click'
import 'hypermd/hypermd/addon/hover'
import 'hypermd/hypermd/addon/paste'

@Injectable()
export class EditorService {

  private configuration = {
    lineNumbers: false,
    lineWrapping: true,
    cursorBlinkRate: 400,
    cursorScrollMargin: 100,
    theme: 'hypermd-light',
    mode: {name: 'text/x-hypermd', globalVars: true},
    extraKeys: {
      Enter: 'newlineAndIndentContinueMarkdownList'
    },
    hmdHideToken: '(profile-1)',
    hmdCursorDebounce: true,
    hmdAutoFold: 200,
    hmdPaste: true,
    hmdFoldMath: { interval: 200, preview: false }
  }

  private editor: CodeMirror.Editor

  initEditor (editor: CodeMirror.Editor): void {
    this.editor = editor
    this.initHyperMD()
    this.addShortcuts()
    this.setupGlobalForTests()
  }

  initHyperMD (): void {
    const tmp = this.editor as any
    tmp.hmdHoverInit()
    tmp.hmdClickInit()
  }

  addShortcuts (): void {
    this.editor.addKeyMap({
      // bold
      'Ctrl-B': (cm) => {
        this.toggleStyle(cm, '__', {__: new RegExp('[\\s\\S]*__[\\s\\S]*__[\\s\\S]*'),
          '**': new RegExp('[\\s\\S]*\\*\\*[\\s\\S]*\\*\\*[\\s\\S]*')})
      },
      // italic
      'Ctrl-I': (cm) => {
        this.toggleStyle(cm, '_', {_: new RegExp('[^_]*(_|___)[^_][\\s\\S]*[^_](_|___)[^_]*', 'y'),
          '*': new RegExp('[^\\*]*(\\*|\\*\\*\\*)[^\\*][\\s\\S]*[^\\*](\\*|\\*\\*\\*)[^\\*]*', 'y')})
      },
      // strikethrough
      'Ctrl-Alt-S': (cm) => {
        this.toggleStyle(cm, '~~', {'~~': new RegExp('.*~~.*~~.*')})
      },
      // link
      'Ctrl-K': (cm) => {
        this.handleLink(cm)
      }
    })
  }

  handleLink (cm: any): void {
    const selectedText = cm.getSelection()
    if (selectedText.length > 0) {
      if (typeof cm === typeof this.editor) { // we expect a CodeMirror.Doc but sometimes we are provided a CodeMirror.Editor
        cm = cm.getDoc()
      }
      const linkRE = new RegExp('^\\[[\\s\\S]*\\]\\([\\s\\S]*\\)', 'y')

      const beginOfSelection = this.getBeginningOfSelection(cm)
      const endOfSelection = this.getEndOfSelection(cm)

      // the selection is the exact Markdown syntax for links
      if (linkRE.test(selectedText)) {
        const sizeOfLinkBeforeURL = selectedText.match(new RegExp('\\[[\\s\\S]*\\]\\('))[0].length
        const sizeOfURL = selectedText.match(new RegExp(']\\([\\s\\S]*\\)'))[0].length - 3
        cm.setSelection({line: endOfSelection.line, ch: beginOfSelection.ch + sizeOfLinkBeforeURL},
          {line: endOfSelection.line, ch: beginOfSelection.ch + sizeOfLinkBeforeURL + sizeOfURL})
      } else { // otherwise we look for the link style in the selection
        let position = {line: beginOfSelection.line, ch: beginOfSelection.ch}
        const end = {line: endOfSelection.line, ch: endOfSelection.ch}
        let foundLinkStyle = false
        while (!(position.ch === end.ch && position.line === end.line && !foundLinkStyle)) {

          // to handle several lines selections
          cm.setSelection(position, {line: position.line, ch: position.ch + 1})
          if (!foundLinkStyle && cm.listSelections()[0].anchor.ch === cm.listSelections()[0].head.ch) {
            position = {line: position.line + 1, ch: -1}
          }
          if (!foundLinkStyle && cm.cm.getTokenAt(position).type && cm.cm.getTokenAt(position).type.includes('link')) {
            foundLinkStyle = true
          }
          if (foundLinkStyle) {
            // Markdown syntax for URL : [text](url). Link type exists only on : '[text](u'
            if (cm.cm.getTokenAt(position).string === '(' || !cm.cm.getTokenAt(position).type.includes('link')) {
              const beginningOfURL = {line: position.line, ch: position.ch}
              while (cm.cm.getTokenAt(position).string !== ')') {
                position.ch++
              }
              position.ch--
              cm.setSelection(beginningOfURL, position)
              return
            }
          }
          position.ch++
        }
        // then link style does not exist at all in the selection, we initiate it
        cm.setSelection(beginOfSelection, endOfSelection)
        cm.replaceSelection('[' + selectedText + '](url)', 'end')
        const pos = cm.getCursor()
        cm.setSelection({line: pos.line, ch: pos.ch - 1}, {line: pos.line, ch: pos.ch - 4})
      }
    }
  }

  toggleStyle (cm: any, tokenSyntax: string, reTokenSyntaxs: any): void {
    let isAlreadyStyled = false
    const selectedText = cm.getSelection()

    if (selectedText.length > 0) {
      for (const reTokenSyntax in reTokenSyntaxs) {
        if (typeof reTokenSyntaxs[reTokenSyntax] === typeof(new RegExp(''))) {
          const reStyle: RegExp = reTokenSyntaxs[reTokenSyntax]
          const isStyled = reStyle.test(selectedText)

          if (isStyled) {
            tokenSyntax = reTokenSyntax
          }

          isAlreadyStyled = isAlreadyStyled || isStyled
        }

      }

      if (!isAlreadyStyled) { // add style
        cm.replaceSelection(tokenSyntax + selectedText + tokenSyntax, 'around')
      } else { // remove style
        let subSelectedText = selectedText
        let beginOuterText = ''
        let endOuterText = ''
        let beginTmp = ''
        let endTmp = ''

        while (subSelectedText.length > 2 * tokenSyntax.length + 1) {

          beginTmp = subSelectedText.slice(0, tokenSyntax.length)
          endTmp = subSelectedText.slice(-tokenSyntax.length)

          if (beginTmp === tokenSyntax && endTmp === tokenSyntax) {
            cm.replaceSelection(beginOuterText + subSelectedText.slice(tokenSyntax.length, -tokenSyntax.length) + endOuterText, 'around')
            return
          }

          beginOuterText = beginOuterText + beginTmp.slice(0, 1)
          endOuterText = endTmp.slice(-1) + endOuterText
          subSelectedText = subSelectedText.slice(1, -1)

        }
      }
    }
  }

  setupGlobalForTests () {
    const doc = this.editor.getDoc() as any
    window.muteTest = {
      insert: (index: number, text: string) => {
        doc.replaceRange(text, doc.posFromIndex(index), null, '+input')
      },
      delete: (index: number, length: number) => {
        doc.replaceRange('', doc.posFromIndex(index), doc.posFromIndex(index + length), '+input')
      },
      getText: (index?: number, length?: number) => {
        if (index) {
          return this.editor.getValue().substr(index, length)
        } else {
          return this.editor.getValue()
        }
      }
    }
  }

  // TOOLS
  getBeginningOfSelection (cm: CodeMirror.Doc): CodeMirror.Position {
    const selection = cm.listSelections()[0]
    if (selection.anchor.line === selection.head.line) {
      return selection.anchor.ch < selection.head.ch ? selection.anchor : selection.head
    } else {
      return selection.anchor.line < selection.head.line ? selection.anchor : selection.head
    }
  }

  getEndOfSelection (cm: CodeMirror.Doc): CodeMirror.Position {
    const selection = cm.listSelections()[0]
    if (selection.anchor.line === selection.head.line) {
      return selection.anchor.ch > selection.head.ch ? selection.anchor : selection.head
    } else {
      return selection.anchor.line > selection.head.line ? selection.anchor : selection.head
    }
  }

  // Getters and setters
  get editorConfiguration () {
    return this.configuration
  }

}
