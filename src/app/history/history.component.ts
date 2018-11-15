import { Component, ElementRef, Injectable, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'
import { ActivatedRoute } from '@angular/router'
import * as CodeMirror from 'codemirror'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/javascript/javascript'
import { Subscription } from 'rxjs'

import { Author } from '../core/Author'
import { Doc } from '../core/Doc'
import { UiService } from '../core/ui/ui.service'
import { CONTROLS } from './controls/controls'
import { HistoryService, IDelete, IInsert } from './history.service'
import { TimelineComponent } from './timeline/timeline.component'

@Component({
  selector: 'mute-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
@Injectable()
export class HistoryComponent implements OnInit, OnDestroy {
  private operations: Array<IDelete | IInsert>
  private subscriptions: Subscription[]
  public docAuthors: Author[]

  @ViewChild('editorElt')
  editorElt: ElementRef
  @ViewChild(TimelineComponent)
  timelineComponent: TimelineComponent
  @ViewChild('sidenavElm')
  sidenavElm
  @ViewChild('leftSidenavElm')
  leftSidenavElm
  @ViewChild('rightSidenavElm')
  rightSidenavElm
  public editor: CodeMirror.Editor
  public currentOp: number
  public doc: Doc
  public step: number

  public rightSideNavMode = 'side'

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private history: HistoryService,
    public ui: UiService,
    public media: ObservableMedia
  ) {
    this.step = 1
    this.subscriptions = []
  }

  ngOnInit() {
    // TODO replace by the specified service which maybe exist
    this.subscriptions.push(
      this.route.data.subscribe(({ doc }: { doc: Doc }) => {
        this.doc = doc
        this.history.getAuthors(this.doc).then((docAuths: Author[]) => {
          this.docAuthors = docAuths
        })

        this.history.getOperations(this.doc).then((ops: Array<IDelete | IInsert>) => {
          this.operations = ops
          this.showVersion(this.operations.length)
        })

        this.subscriptions.push(
          this.ui.onNavToggle.subscribe(() => {
            this.leftSidenavElm.opened = !this.leftSidenavElm.opened
          })
        )

        this.subscriptions.push(
          this.ui.onDocNavToggle.subscribe(() => {
            this.rightSidenavElm.opened = !this.rightSidenavElm.opened
          })
        )

        this.currentOp = 0
      })
    )

    // this.operations = OPERATIONS
    // this.currentOp = this.operations.length
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
      this.editor = CodeMirror(this.editorElt.nativeElement, {
        value: '',
        mode: 'gfm',
        readOnly: 'true',
        lineWrapping: true,
      })
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  /**
   * numOperations corresponds to a numero between
   * 1 and countOperation().
   */
  showVersion(numOperation: number) {
    // let begin = 0
    // let end = 0
    // let reverse = false
    // // TODO Refactoring to avoid those tests
    // if (this.currentOp === this.countOperations()) {
    //   begin = this.operations[this.currentOp - 1].offset
    // } else {
    //   begin = this.operations[this.currentOp].offset
    // }
    // if (numOperation === this.countOperations()) {
    //   end = this.operations[numOperation - 1].offset
    // } else {
    //   end = this.operations[numOperation].offset
    // }
    // if (this.currentOp > numOperation) {
    //   reverse = true
    // }
    // if (this.currentOp !== numOperation) {
    //   const doc = this.editor.getDoc() as any
    //   // Generate string content depending on operations
    //   const generatedText = this.generateText(0, numOperation - 1)
    //   // just replace the content of editor the generated text.
    //   doc.setValue(generatedText)
    //   this.currentOp = numOperation
    // }
    // if (this.state) {
    //   if (begin === end) {
    //     end += 1
    //   }
    //   this.colorizeDifferences(begin, end, reverse)
    // } else {
    //   this.colorizeAuthors(begin, end + 1)
    // }
  }

  generateText(beginOp: number, endOp: number): string {
    const textContent = ''
    // for (let i = beginOp; i <= endOp; i++) {
    //   const currentOp = this.operations[i]
    //   if (currentOp instanceof TextInsert) {
    //     textContent = textContent.slice(0, currentOp.offset) + currentOp.content + textContent.slice(currentOp.offset)
    //   } else if (currentOp instanceof TextDelete) {
    //     textContent = textContent.slice(0, currentOp.offset) + textContent.slice(currentOp.offset + currentOp.length, textContent.length)
    //   }
    // }
    return textContent
  }

  destroyText(begin, end) {
    const doc = this.editor.getDoc()
    const pos1 = doc.posFromIndex(begin)
    const pos2 = doc.posFromIndex(end + 1)
    doc.markText({ line: pos1.line, ch: pos1.ch }, { line: pos2.line, ch: pos2.ch }, { css: 'background-color: red' })
    doc.markText(
      { line: pos1.line, ch: pos1.ch },
      { line: pos2.line, ch: pos2.ch },
      {
        css: 'animation-name: slideout;' + 'animation-duration: 0.5s;',
      }
    )
  }

  countOperations(): number {
    return this.operations ? this.operations.length : 0
  }

  countMax(): number {
    if (this.countOperations() === 0) {
      return 0
    }
    return Math.floor(this.countOperations() / 2)
  }

  onInputChange(event: any) {
    let indexOp = event.target.value
    indexOp = indexOp >= this.countOperations() ? this.countOperations() : indexOp
    indexOp = indexOp <= 0 ? 1 : indexOp
    this.showVersion(indexOp)
  }

  colorizeAuthors(begin: number, end: number) {
    const doc = this.editor.getDoc()
    const pos1 = doc.posFromIndex(begin)
    const pos2 = doc.posFromIndex(end)
    if (this.docAuthors) {
      length = this.docAuthors.length
    }
    this.animateText(begin, end)
    const color = this.docAuthors[Math.floor(Math.random() * 10) % length].getColor()
    doc.markText({ line: pos1.line, ch: pos1.ch }, { line: pos2.line, ch: pos2.ch }, { css: 'background-color: ' + color })
  }

  colorizeDifferences(begin: number, end: number, reverse: boolean) {
    const doc = this.editor.getDoc()
    const pos1 = doc.posFromIndex(begin)
    const pos2 = doc.posFromIndex(end)
    this.animateText(begin, end)
    if (!reverse) {
      doc.markText({ line: pos1.line, ch: pos1.ch }, { line: pos2.line, ch: pos2.ch }, { css: 'background-color: #4CAF50' })
    } else {
      doc.markText({ line: pos1.line, ch: pos1.ch }, { line: pos2.line, ch: pos2.ch }, { css: 'background-color: #E57373' })
    }
  }

  animateText(begin: number, end: number) {
    const doc = this.editor.getDoc()
    const pos1 = doc.posFromIndex(begin)
    const pos2 = doc.posFromIndex(end)
    doc.markText(
      { line: pos1.line, ch: pos1.ch },
      { line: pos2.line, ch: pos2.ch },
      {
        css: 'animation-name: slidein;' + 'animation-duration: 0.300s;',
      }
    )
  }

  onControlsChange(controlType: number) {
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

  onToggle() {
    this.showVersion(this.currentOp)
  }

  updateStep(step: number) {
    this.step = step <= 0 ? 1 : step
  }
}
