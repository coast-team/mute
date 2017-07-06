import {
  Injectable
} from '@angular/core'

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
    hmdFoldMath: { interval: 200, preview: true }
  }

  private editor: CodeMirror.Editor

  initEditor (editor: CodeMirror.Editor): void {
    this.editor = editor
    this.initHyperMD()
    this.addShortcuts()
    this.setupGlobalForTests()
  }

  initHyperMD (): void {
    let tmp = this.editor as any
    tmp.hmdHoverInit()
    tmp.hmdClickInit()
  }

  addShortcuts (): void {
    this.editor.addKeyMap({
      // bold
      'Ctrl-B': (cm) => {
        this.toggleStyle(cm, '**', {'**': new RegExp('[\\s\\S]*\\*\\*[\\s\\S]*\\*\\*[\\s\\S]*'),
          __: new RegExp('[\\s\\S]*__[\\s\\S]*__[\\s\\S]*')})
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
    const linkRE = new RegExp('^\\[[\\s\\S]*\\]\\([\\s\\S]*\\)', 'y')
    let pos = cm.listSelections()[0].anchor
    let line = pos.line
    let ch = pos.ch

    if (!linkRE.test(selectedText)) {
      cm.replaceSelection('[' + selectedText + '](url)', 'end')
      pos = cm.getCursor()
      line = pos.line
      ch = pos.ch
      cm.setCursor({line, ch: ch - 4})
    } else {
      let sizeOfLinkBeforeURL = selectedText.match(new RegExp('\\[[\\s\\S]*\\]\\('))[0].length
      if (ch < cm.listSelections()[0].head.ch) {
        cm.setCursor({line, ch: ch + sizeOfLinkBeforeURL})
      } else {
        cm.setCursor({line, ch: ch - (selectedText.length - sizeOfLinkBeforeURL)})
      }
    }
  }

  toggleStyle (cm: any, tokenSyntax: string, reTokenSyntaxs: any): void {
    let isAlreadyStyled = false
    const selectedText = cm.getSelection()

    if (selectedText.length > 0) {
      for (let reTokenSyntax in reTokenSyntaxs) {
        if (typeof reTokenSyntaxs[reTokenSyntax] === typeof(new RegExp(''))) {
          const reStyle: RegExp = reTokenSyntaxs[reTokenSyntax]
          let isStyled = reStyle.test(selectedText)

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
            cm.replaceSelection(beginOuterText + subSelectedText.slice(tokenSyntax.length, -tokenSyntax.length) + endOuterText)
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

  // Getters and setters
  get editorConfiguration () {
    return this.configuration
  }

}
