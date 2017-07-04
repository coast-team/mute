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
        this.toggleStyle(cm, '**', {'\\*\\*': '**', __: '__'})
      },
      // italic
      'Ctrl-I': (cm) => {
        this.toggleStyle(cm, '_', {_: '_', '\\*': '*'})
      },
      // strikethrough
      'Ctrl-Alt-S': (cm) => {
        this.toggleStyle(cm, '~~', '~~')
      },
      // link
      'Ctrl-K': (cm) => {
        let s = cm.getSelection()
        let t = s.slice(0, 1) === '[' && s.slice(-6) === ['](url)']
        cm.replaceSelection(t ? s.slice(1, -6) : '[' + s + '](url)', 'around')
      }
    })
  }

  toggleStyle (cm: any, tokenSyntax: string, reTokenSyntaxs: any): void {
    let isAlreadyStyled = false

    const selectedText = cm.getSelection()

    for (let reTokenSyntax in reTokenSyntaxs) {
      if (typeof reTokenSyntaxs[reTokenSyntax] === 'string') {
        const reStyle: RegExp = new RegExp('.*' + reTokenSyntax + '.*' + reTokenSyntax + '.*')
        let isStyled = reStyle.test(selectedText)

        if (isStyled) {
          tokenSyntax = reTokenSyntaxs[reTokenSyntax]
        }

        isAlreadyStyled = isAlreadyStyled || isStyled
      }

    }

    if (!isAlreadyStyled) { // add style
      cm.replaceSelection(tokenSyntax + selectedText + tokenSyntax, 'around')
    } else {
      // remove style
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
