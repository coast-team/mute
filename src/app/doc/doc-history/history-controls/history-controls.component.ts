import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { CONTROLS } from './controls'

@Component({
  selector: 'mute-history-controls',
  templateUrl: './history-controls.component.html',
  styleUrls: ['./history-controls.component.scss']
})
export class HistoryControlsComponent implements OnInit {

  isPlaying: boolean
  @Output() onControls: EventEmitter<Number>

  constructor () {
    this.onControls = new EventEmitter<number>()
  }

  ngOnInit () {
    this.isPlaying = false
  }

  onClickPlay (event: any) {
    this.isPlaying = !this.isPlaying
    this.onControls.emit(this.isPlaying ? CONTROLS.PLAY : CONTROLS.PAUSE)
  }

  onClickFastForward (event: any) {
    this.onControls.emit(CONTROLS.FAST_FORWARD)
  }

  onClickFastRewind (event: any) {
    this.onControls.emit(CONTROLS.FAST_REWIND)
  }

}
