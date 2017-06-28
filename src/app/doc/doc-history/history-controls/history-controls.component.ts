import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { CONTROLS } from './controls'
import { ActivatedRoute, Router } from '@angular/router'
import { Doc } from '../../../core/Doc'
import { UiService } from '../../../core/ui/ui.service'

@Component({
  selector: 'mute-history-controls',
  templateUrl: './history-controls.component.html',
  styleUrls: ['./history-controls.component.scss']
})
export class HistoryControlsComponent implements OnInit {

  public isPlaying: boolean
  @Input() currentOp: number
  @Input() nbOperations: number
  @Output() onControls: EventEmitter<Number>

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    public ui: UiService) {
    this.onControls = new EventEmitter<number>()
  }

  ngOnInit () {
    this.isPlaying = false
  }

  onClickPlay (event: any) {

    if (this.currentOp === this.nbOperations) {
      this.isPlaying = false
      this.onControls.emit(CONTROLS.PAUSE)
    } else {
      this.isPlaying = !this.isPlaying
      this.onControls.emit(this.isPlaying ? CONTROLS.PLAY : CONTROLS.PAUSE)
    }
  }

  onClickFastForward (event: any) {
    this.onControls.emit(CONTROLS.FAST_FORWARD)
  }

  onClickFastRewind (event: any) {
    this.onControls.emit(CONTROLS.FAST_REWIND)
  }
}
