import {
  Component,
  SimpleChange,
  EventEmitter,
  OnInit,
  OnChanges,
  ViewChild,
  Input,
  Output } from '@angular/core'

@Component({
  selector: 'mute-edit-field',
  templateUrl: './edit-field.component.html',
  styleUrls: [ './edit-field.component.scss' ]
})
export class EditFieldComponent implements OnInit, OnChanges {

  @Input() value = ''
  @Input() emptyValue: string
  @Input() icon = ''
  @Input() selectAll = true
  @Output() onDone = new EventEmitter<string>()

  @ViewChild('editableElm') editableElm
  @ViewChild('bottomLine') bottomLine
  public viewState = true
  public preEditState = false
  public editState = false

  constructor () { }

  ngOnInit () {
    this.editableElm.nativeElement.textContent = this.value
  }

  ngOnChanges (changes: {value: SimpleChange}) {
    if (changes.value.currentValue !== this.editableElm.nativeElement.textContent) {
      this.editableElm.nativeElement.textContent = changes.value.currentValue
    }
  }

  iconSet () {
    return this.icon !== ''
  }

  toggleViewState () {
    if (!this.editState) {
      this.preEditState = false
      this.bottomLine.nativeElement.style.width = 0
    }
  }

  togglePreEditState () {
    if (!this.editState) {
      this.viewState = false
      this.bottomLine.nativeElement.style.height = '1px'
      this.bottomLine.nativeElement.style.width = '100%'
    }
  }

  edit () {
    log.debug('EDIT')
    this.bottomLine.nativeElement.style.height = '2px'
    if (this.bottomLine.nativeElement.style.width !== '100%') {
      this.bottomLine.nativeElement.style.width = '100%'
    }
    if (this.viewState) {
      this.viewState = false
    }
    if (this.selectAll) {
      const range = window.document.createRange()
      range.selectNodeContents(this.editableElm.nativeElement)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
    this.editState = true
  }

  done (event) {
    if (this.editState && event.type === 'blur' || (event.type === 'keydown' && event.keyCode === 13)) {
      this.editState = false
      this.preEditState = false
      event.preventDefault()
      window.getSelection().removeAllRanges()
      this.editableElm.nativeElement.blur()
      this.bottomLine.nativeElement.style.width = 0
      const currentValue = this.editableElm.nativeElement.textContent
      if (currentValue === '') {
        this.editableElm.nativeElement.textContent = this.emptyValue
      }
      if (this.value !== currentValue) {
        this.value = currentValue
        this.onDone.emit(currentValue)
      }
    }
  }
}
