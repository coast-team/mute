import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'

import { Doc } from '../../core/Doc'
import { UiService } from '../../core/ui/ui.service'
import { CONTROLS } from './controls'

@Component({
  selector: 'mute-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit {
  public isPlaying: boolean
  public pausePlayBtn: string
  @Input()
  currentOp: number
  @Input()
  nbOperations: number
  @Input()
  max: number
  @Input()
  doc: Doc
  @Output()
  controls: EventEmitter<number>
  @Output()
  slide: EventEmitter<number>

  constructor(private router: Router, public ui: UiService) {
    this.pausePlayBtn = 'play_arrow'
    ;(this.controls = new EventEmitter<number>()), (this.slide = new EventEmitter<number>())
  }

  ngOnInit() {
    this.isPlaying = false
  }

  onClickPlay() {
    if (this.currentOp === this.nbOperations) {
      this.isPlaying = false
      this.controls.emit(CONTROLS.PAUSE)
    } else {
      this.isPlaying = !this.isPlaying
      this.controls.emit(this.isPlaying ? CONTROLS.PLAY : CONTROLS.PAUSE)
    }
    this.pausePlayBtn = this.isPlaying && this.nbOperations !== this.currentOp ? 'pause' : 'play_arrow'
  }

  onClickFastForward() {
    this.controls.emit(CONTROLS.FAST_FORWARD)
  }

  onClickFastRewind() {
    this.controls.emit(CONTROLS.FAST_REWIND)
  }

  updateStep(step: number) {
    this.slide.emit(step)
  }

  showEditor() {
    this.router.navigate(['/' + this.doc.signalingKey])
  }
}
