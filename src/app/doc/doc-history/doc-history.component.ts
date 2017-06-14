import {
  Component,
  OnInit,
  Injectable,
  Input,
  ViewChild,
  ElementRef,
  NgZone } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { DocService } from 'mute-core/lib'
import { TextDelete, TextInsert }  from 'mute-structs'
import * as CodeMirror from 'codemirror'

import { TimelineComponent }  from './timeline/timeline.component'
import { Doc } from '../../core/Doc'
import { Author } from '../../core/Author'
import { DocHistoryService, Delete, Insert } from './doc-history.service'
import { CONTROLS } from './history-controls/controls'
import { UiService } from '../../core/ui/ui.service'

import { OPERATIONS } from './mock-operations'

require('codemirror/mode/gfm/gfm')
require('codemirror/mode/javascript/javascript')

@Component({
  selector: 'mute-doc-history',
  templateUrl: './doc-history.component.html',
  styleUrls: ['./doc-history.component.scss'],
  providers: [DocHistoryService]
})

@Injectable()
export class DocHistoryComponent implements OnInit {

  private isInited = false
  private operations: (Delete | Insert)[]
  public docAuthors: Author[]

  @Input() docService: DocService
  @ViewChild('editorElt') editorElt: ElementRef
  @ViewChild(TimelineComponent) timelineComponent: TimelineComponent
  @ViewChild('leftSidenavElm') leftSidenavElm
  public editor: CodeMirror.Editor
  public currentOp: number


  constructor (
    private zone: NgZone,
    private route: ActivatedRoute,
    private docHistory: DocHistoryService,
    public ui: UiService,
  ) { }

  ngOnInit () {
    // TODO replace by the specified service which maybe exist
    this.route.data.subscribe((data: {doc: Doc}) => {

      this.docHistory.getAuthors(data.doc)
        .then((docAuths: Author[]) => {
          this.docAuthors = docAuths
          this.mockTextColors()
        })

      this.docHistory.getOperations(data.doc)
        .then((ops: (Delete | Insert)[]) => {
          this.operations = ops
          this.showVersion(this.operations.length)

        })

      this.ui.onNavToggle.subscribe(() => {
        this.leftSidenavElm.opened = !this.leftSidenavElm.opened
      })
    })


    // this.operations = OPERATIONS
    // this.currentOp = this.operations.length
    const elm1 = document.getElementById('textArea')
    const elm2 = this.editorElt.nativeElement
    /*
    * Here you have elm1 === elm2.
    * The first is a native browser approach.
    * The second is an Angular approach.
    * But the result is the same.
    */

    /*
    * We have NgZone imported in this module and injected its instance
    * by Angular (see constructor property).
    * We run the following code what we call outside of Angular zone,
    * because we do not want Angular detect any modification done inside
    * CodeMirror and manage it ourselves.
    * Q. Why this?
    * A. To understand well a more detailed comprehension of Angular
    * detect changes mechanism is mandatory, but in two words
    * if we do not do it, we will have a performance issue,
    * as Angular would run detectChanges mechanism infinitely.
    */
    this.zone.runOutsideAngular(() => {
      this.editor = CodeMirror(elm1, {
        value: '',
        mode: 'gfm',
        readOnly: 'true',
        lineWrapping: true
      })
    })
  }

  /**
   * numOperations corresponds to a numero between
   * 1 and countOperation().
   */
  showVersion (numOperation: number) {
    if (this.currentOp !== numOperation) {
      const doc = this.editor.getDoc() as any
      // Generate string content depending on operations
      const generatedText = this.generateText(0, numOperation - 1)
      // just replace the content of editor the generated text.
      doc.setValue(generatedText)
      this.currentOp = numOperation
    }
    this.mockTextColors()
  }

  generateText (beginOp: number, endOp: number): String {
    let textContent = ''
    for (let i = beginOp; i <= endOp; i++) {
      const currentOp = this.operations[i]
      if (currentOp instanceof TextInsert) {
        textContent = textContent.slice(0, currentOp.offset) +
        currentOp.content + textContent.slice(currentOp.offset)
      } else if (currentOp instanceof TextDelete) {
        textContent = textContent.slice(0, currentOp.offset) +
        textContent.slice(currentOp.offset + currentOp.length, textContent.length)
      }
    }
    return textContent
  }

  countOperations (): number {
    return this.operations ? this.operations.length : 0
  }

  onInputChange (event: any) {
    let indexOp = event.target.value
    indexOp = indexOp >= this.countOperations() ? this.countOperations() : indexOp
    indexOp = indexOp <= 0 ? 1 : indexOp
    this.showVersion(indexOp)
  }

  mockTextColors () {
    const doc = this.editor.getDoc()
    let cpt = 0
    let length = 0
    doc.eachLine((l) => {
      if (this.docAuthors) {
        length = this.docAuthors.length
      }
      let color = this.docAuthors[(Math.floor(Math.random() * 10)) % length].getColor()
      doc.markText({line: cpt, ch: (Math.floor(Math.random() * 10))},
       {line: cpt, ch: (Math.floor(Math.random() * 200))}, {css: 'background-color: ' + color})
      cpt += (Math.floor(Math.random() * 10))
    })
  }

  onControlsChange (controlType: number) {
    // log.angular('controls', controlType)
    switch (controlType) {
    case CONTROLS.PLAY:
      this.timelineComponent.play()
      break
    case CONTROLS.PAUSE:
      this.timelineComponent.pause()
      break
    case CONTROLS.FAST_FORWARD:
      this.timelineComponent.goToEnd()
      break
    case CONTROLS.FAST_REWIND:
      this.timelineComponent.goToBegin()
      break
    }
  }

}
