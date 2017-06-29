import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import * as CodeMirror from 'codemirror'

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
import 'mathjax/MathJax.js'
// SETTING: The 4 imports below load a particular configuration for using fold-math
// See others configurations here: http://docs.mathjax.org/en/latest/config-files.html#common-configurations
import 'mathjax/config/TeX-AMS_CHTML.js'
import 'mathjax/jax/output/CommonHTML/jax.js'
import 'mathjax/jax/output/CommonHTML/fonts/TeX/fontdata.js'
import 'hypermd/hypermd/addon/fold-math'
import 'hypermd/hypermd/addon/readlink'
import 'hypermd/hypermd/addon/click'
import 'hypermd/hypermd/addon/hover'
import 'hypermd/hypermd/addon/paste'

import { DocService } from 'mute-core'
import { TextDelete, TextInsert }  from 'mute-structs'

@Component({
  selector: 'mute-editor',
  templateUrl: './editor.component.html',
  styleUrls: [
    // FIXME: Importing CodeMirror's CSS here doesn't work.
    // Should find a proper way to do it.
    './editor.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

@Injectable()
export class EditorComponent implements OnChanges, OnDestroy, OnInit {

  private isInited = false

  private docValueSubscription: Subscription
  private remoteOperationsSubscription: Subscription

  private textOperationsObservable: Observable<(TextDelete | TextInsert)[][]>

  @Input() docService: DocService
  @Output() isReady: EventEmitter<any> = new EventEmitter()
  @ViewChild('editorElt') editorElt

  public editor: CodeMirror.Editor

  constructor (
    private zone: NgZone
  ) {}

  ngOnInit () {
    this.zone.runOutsideAngular(() => {
      this.editor = CodeMirror.fromTextArea(this.editorElt.nativeElement, {
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
      } as any)

      let instance: any = this.editor
      instance.hmdHoverInit()
      instance.hmdClickInit()

      instance.addKeyMap({
        // bold
        'Ctrl-B': (cm) => {
          toggleStyle(cm, '**', '\\*\\*')
        },
        // italic
        'Ctrl-I': (cm) => {
          toggleStyle(cm, '_', '_')
        },
        // strikethrough
        'Ctrl-Alt-S': (cm) => {
          toggleStyle(cm, '~~', '~~')
        },
        // link
        'Ctrl-K': (cm) => {
          let s = cm.getSelection()
          let t = s.slice(0, 1) === '[' && s.slice(-1) === ['](url)']
          cm.replaceSelection(t ? s.slice(1, -1) : '[' + s + '](url)', 'around')
        }
      })

      // For Quentin's test
      this.setupGlobalForTests()

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

      this.textOperationsObservable = multipleOperationsStream.map( (changeEvents: ChangeEvent[]) => {
        return changeEvents.map( (changeEvent: ChangeEvent ) => {
          return changeEvent.toTextOperations()
        })
      })

      this.docService.localTextOperationsSource = this.textOperationsObservable

    // multipleOperationsStream.subscribe(
    //   (changeEvents: ChangeEvent[]) => {
    //     console.log(`${changeEvents.length} operations:`)
    //     changeEvents.forEach((changeEvent: ChangeEvent) => {
    //       console.log(changeEvent.instance)
    //       console.log(changeEvent.change)
    //     })
    //   })

      this.isReady.next(undefined)
    })
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.zone.runOutsideAngular(() => {
      if (this.isInited) {
        this.docValueSubscription.unsubscribe()
        this.remoteOperationsSubscription.unsubscribe()
      }

      // First ngOnChanges is called before ngOnInit
      // This observable is not ready yet
      if (this.textOperationsObservable !== undefined) {
        this.docService.localTextOperationsSource = this.textOperationsObservable
      }

      this.docValueSubscription = this.docService.onDocValue.subscribe( (str: string) => {
        this.editor.setValue(str)
      })

      this.remoteOperationsSubscription = this.docService.onRemoteTextOperations.subscribe( (textOperations: any[]) => {

        const updateDoc: () => void = () => {
          const doc: CodeMirror.Doc = this.editor.getDoc()

          // log.info('operation:editor', 'applied: ', textOperations)

          textOperations.forEach( (textOperation: any) => {
            const from: CodeMirror.Position = doc.posFromIndex(textOperation.offset)
            if (textOperation instanceof TextInsert) {
              doc.replaceRange(textOperation.content, from)
            } else if (textOperation instanceof TextDelete) {
              const to: CodeMirror.Position = doc.posFromIndex(textOperation.offset + textOperation.length)
              doc.replaceRange('', from, to)
            }
          })
        }

        this.editor.operation(updateDoc)
      })

      if (this.isInited) {
        this.isReady.next(undefined)
      } else {
        this.isInited = true
      }
    })
  }

  ngOnDestroy () {
    this.docValueSubscription.unsubscribe()
    this.remoteOperationsSubscription.unsubscribe()
  }

  focus () {
    this.editor.focus()
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

    // log.info('operation:editor', 'generated: ', textOperations)
    return textOperations
  }

  isInsertOperation (): boolean {
    return this.change.text.length > 1 || this.change.text[0].length > 0
  }

  isDeleteOperation (): boolean {
    return this.change.removed.length > 1 || this.change.removed[0].length > 0
  }
}

function toggleStyle (cm: any, tokenSyntax: string, reTokenSyntax: string): void {
  const DEBUG = true

  const selectedText = cm.getSelection()

  const reStyle: RegExp = new RegExp('.*' + reTokenSyntax + '.*' + reTokenSyntax + '.*')

  if (!selectedText.match(reStyle)) { // if not found, then the style does not exist yet
    if (DEBUG) { console.log('there\'s not style on this selection') }
    cm.replaceSelection(tokenSyntax + selectedText + tokenSyntax, 'around')
  } else { // otherwise
    let subSelectedText = selectedText
    let beginOuterText = ''
    let endOuterText = ''
    let beginTmp = ''
    let endTmp = ''

    while (subSelectedText.length > 2 * tokenSyntax.length + 1) {
      if (DEBUG) { console.log('subSelectedText ' + subSelectedText) }

      beginTmp = subSelectedText.slice(0, tokenSyntax.length)
      endTmp = subSelectedText.slice(-tokenSyntax.length)

      if (DEBUG) { console.log('beginTmp ' + beginTmp) }
      if (DEBUG) { console.log('endTmp ' + endTmp) }
      if (DEBUG) { console.log('just to be sure : ' + subSelectedText) }

      if (beginTmp === tokenSyntax && endTmp === tokenSyntax) {
        if (DEBUG) { console.log('FOUND') }
        cm.replaceSelection(beginOuterText + subSelectedText.slice(tokenSyntax.length, -tokenSyntax.length) + endOuterText)
        return
      }

      beginOuterText = beginOuterText + beginTmp.slice(0, 1)
      endOuterText = endTmp.slice(-1) + endOuterText
      subSelectedText = subSelectedText.slice(1, -1)

    }
  }
}
