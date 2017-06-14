import {
  Component,
  OnInit,
  Injectable,
  Input,
  ViewChild,
  ElementRef,
  NgZone } from '@angular/core'
import { DocService } from 'mute-core/lib'
import * as CodeMirror from 'codemirror'


require('codemirror/mode/gfm/gfm')
require('codemirror/mode/javascript/javascript')

@Component({
  selector: 'mute-history-editor',
  templateUrl: './history-editor.component.html',
  styleUrls: ['./history-editor.component.scss'],
  providers: []
})

@Injectable()
export class HistoryEditorComponent implements OnInit {

  private isInited = false

  @Input() docService: DocService
  @ViewChild('editorElt') editorElt: ElementRef

  public editor: CodeMirror.Editor

  constructor (
    private zone: NgZone
  ) { }

  countVersions (): number {
    // return this.versions.length
    return 18
  }

  ngOnInit () {
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
      this.editor = CodeMirror(elm2, {
        value: 'this is a sample text',
        mode: 'gfm',
        readOnly: 'true'
      })
    })

    console.log(this.docService)
  }
}
