import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'

import { Doc } from '../../../core/Doc'
import { UiService } from '../../../core/ui/ui.service'
import { CONTROLS } from './controls'

@Component({
  selector: 'mute-history-controls',
  templateUrl: './history-controls.component.html',
  styleUrls: ['./history-controls.component.scss']
})
export class HistoryControlsComponent implements OnInit {

  public isPlaying: boolean
  public pausePlayBtn: string
  @Input() currentOp: number
  @Input() nbOperations: number
  @Input() max: number
  @Input() doc: Doc
  @Output() onControls: EventEmitter<number>
  @Output() onSlide: EventEmitter<number>

  constructor (
    private router: Router,
    public ui: UiService
  ) {
    this.pausePlayBtn = 'play_arrow'
    this.onControls = new EventEmitter<number>(),
    this.onSlide = new EventEmitter<number>()
  }

  ngOnInit () {
    this.isPlaying = false
  }

  onClickPlay () {

    if (this.currentOp === this.nbOperations) {
      this.isPlaying = false
      this.onControls.emit(CONTROLS.PAUSE)
    } else {
      this.isPlaying = !this.isPlaying
      this.onControls.emit(this.isPlaying ? CONTROLS.PLAY : CONTROLS.PAUSE)
    }
    this.pausePlayBtn = (this.isPlaying && this.nbOperations !== this.currentOp) ? 'pause' : 'play_arrow'
  }

  onClickFastForward () {
    this.onControls.emit(CONTROLS.FAST_FORWARD)
  }

  onClickFastRewind () {
    this.onControls.emit(CONTROLS.FAST_REWIND)
  }

  updateStep (step: number) {
    this.onSlide.emit(step)
  }

  showEditor () {
    this.router.navigate(['/' + this.doc.key])
  }
}
