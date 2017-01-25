import {
  Component,
  SimpleChange,
  EventEmitter,
  OnInit,
  OnChanges,
  ViewChild,
  trigger,
  state,
  style,
  transition,
  animate,
  Input,
  Output } from '@angular/core'

@Component({
  selector: 'mute-edit-field',
  templateUrl: './edit-field.component.html',
  styleUrls: [ './edit-field.component.scss' ],
  animations: [
    trigger('viewState', [
      state('active', style({transform: 'scale(1)'})),
      state('void', style({transform: 'scale(0)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ]),
    trigger('preEditState', [
      state('active', style({transform: 'scale(1)'})),
      state('void', style({transform: 'scale(0)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ])
  ]
})
export class EditFieldComponent implements OnInit, OnChanges {

  /**
   * This variable is usefull when the mouse is passing very fast over tag
   * (less then 100ms, see animations->trigger->transition->animate value), thus
   * the state does not have enough time to change. In that case we force it to change.
   */
  private fastLeave = false

  @Input() value: string
  @Input() emptyValue: string
  @Input() icon = ''
  @Input() autofocus = false
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
    if (this.autofocus && this.value === this.emptyValue) {
      this.edit()
      this.autofocus = false
    }
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
      this.bottomLine.nativeElement.style.width = 0
      this.fastLeave = !this.preEditState ? true : false
      this.preEditState = false
    }
  }

  togglePreEditState () {
    log.debug('PreEdit')
    if (!this.editState) {
      this.bottomLine.nativeElement.style.height = '1px'
      this.bottomLine.nativeElement.style.width = '100%'
      this.viewState = false
    }
  }

  viewStateDone (event) {
    if (event.toState === 'void') {
      this.preEditState = true
    }
  }

  preEditStateDone (event) {
    if (event.toState === 'void') {
      this.viewState = true
    } else if (event.fromState === 'void') {
      if (this.fastLeave) {
        this.fastLeave = false
        this.toggleViewState()
      }
    }
  }

  edit () {
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
    } else if (this.autofocus) {
      const range = window.document.createRange()
      range.setStart(this.editableElm.nativeElement.childNodes[0], this.editableElm.nativeElement.textContent.length)
      range.collapse(true)
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
