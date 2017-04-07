import {
  Component,
  SimpleChange,
  EventEmitter,
  OnInit,
  OnChanges,
  ViewChild,
  Input,
  Output,
  ElementRef,
  ChangeDetectionStrategy } from '@angular/core'
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'

@Component({
  selector: 'mute-edit-field',
  templateUrl: './edit-field.component.html',
  styleUrls: [ './edit-field.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('btnState', [
      state('active', style({transform: 'scale(1)'})),
      state('void', style({transform: 'scale(0)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ]),
    trigger('inputState', [
      state('active', style({transform: 'scale(1)'})),
      state('void', style({transform: 'scale(0)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ])
  ]
})
export class EditFieldComponent implements OnInit, OnChanges {

  @Input() value = ''
  @Input() defaultValue: string
  @Output() onDone = new EventEmitter<string>()

  @ViewChild('inputElm') private inputElm: ElementRef

  public editState = false
  public viewState = true

  constructor () { }

  ngOnInit () {
  }

  ngOnChanges (changes: {value: SimpleChange}) {
    // if (changes.value.currentValue !== this.editableElm.value) {
    //   this.editableElm.value = changes.value.currentValue
    // }
  }

  edit () {
    this.viewState = false
  }

  done (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.inputElm.nativeElement.blur()
    } else if (this.editState && event.type === 'blur') {
      const newValue = this.inputElm.nativeElement.value
      this.value = newValue === '' ? this.defaultValue : newValue
      this.onDone.emit(this.value)
      this.editState = false
    }
  }

  btnStateDone (event) {
    if (event.toState === 'void') {
      this.editState = true
    }
  }

  inputStateDone (event) {
    if (event.toState === 'void') {
      this.viewState = true
    } else if (event.toState === 'active') {
      this.inputElm.nativeElement.value = this.value
      this.inputElm.nativeElement.focus()
      this.inputElm.nativeElement.select()
    }
  }
}
