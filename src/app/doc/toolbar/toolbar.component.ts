import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'

import { Doc } from '../../core/Doc'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() doc: Doc
  @Output() menu: EventEmitter<void>
  @Output() info: EventEmitter<void>
  @ViewChild('input') input: ElementRef

  constructor (
    private localStorage: LocalStorageService
  ) {
    this.menu = new EventEmitter()
    this.info = new EventEmitter()
  }

  updateTitle (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.input.nativeElement.blur()
    } else if (event.type === 'blur') {
      const newTitle = this.input.nativeElement.value
      if (this.doc.title !== newTitle) {
        if (newTitle === '') {
          this.doc.title = 'Untitled document'
          this.input.nativeElement.value = this.doc.title
        } else {
          this.doc.title = newTitle
        }
        this.localStorage.save(this.doc)
      }
    }
  }

  selectTitle () {
    this.input.nativeElement.select()
  }
}
