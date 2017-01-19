import {
  Component,
  OnInit,
  ViewChild,
  trigger,
  state,
  style,
  transition,
  animate } from '@angular/core'

import { ProfileService } from 'core/profile/profile.service'

@Component({
  selector: 'mute-pseudonym',
  templateUrl: './pseudonym.html',
  styleUrls: [ './pseudonym.scss' ],
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
export class PseudonymComponent implements OnInit {

  @ViewChild('pseudonymElm') pseudonymElm
  @ViewChild('bottomLine') bottomLine
  public viewState = true
  public preEditState = false
  public editState = false

  constructor (
    private profile: ProfileService
  ) { }

  ngOnInit () {
    this.pseudonymElm.nativeElement.innerHTML = this.profile.pseudonym
  }

  toggleViewState () {
    if (!this.editState) {
      this.bottomLine.nativeElement.style.width = 0
      this.preEditState = false
    }
  }

  togglePreEditState () {
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
    this.pseudonymElm.nativeElement.contentEditable = true
    const range = window.document.createRange()
    range.selectNodeContents(this.pseudonymElm.nativeElement)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    this.editState = true
  }

  done (event) {
    if (event.type === 'blur' || (event.type === 'keydown' && event.keyCode === 13)) {
      event.preventDefault()
      const pseudo = this.pseudonymElm.nativeElement.innerHTML
      if (this.profile.pseudonym !== pseudo) {
        this.profile.pseudonym = pseudo
        if (pseudo === '') {
          this.pseudonymElm.nativeElement.innerHTML = this.profile.pseudonym
        }
      }
      window.getSelection().removeAllRanges()
      this.pseudonymElm.nativeElement.blur()
      this.bottomLine.nativeElement.style.width = 0
      this.pseudonymElm.nativeElement.contentEditable = false
      this.editState = false
      this.preEditState = false
    }
  }
}
