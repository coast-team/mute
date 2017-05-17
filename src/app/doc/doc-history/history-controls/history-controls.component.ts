import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { CONTROLS } from './controls'
import { ActivatedRoute, Router } from '@angular/router'
import { Doc } from '../../../core/Doc'

@Component({
  selector: 'mute-history-controls',
  templateUrl: './history-controls.component.html',
  styleUrls: ['./history-controls.component.scss']
})
export class HistoryControlsComponent implements OnInit {

  isPlaying: boolean
  private docId
  @Output() onControls: EventEmitter<Number>

  constructor (private route: ActivatedRoute, private router: Router) {
    this.onControls = new EventEmitter<number>()
  }

  ngOnInit () {
    this.isPlaying = false
    this.route.data
      .subscribe(({doc}: {doc: Doc}) => {this.docId = doc.id})
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

  showEditor () {
    console.log(this.docId)
    this.router.navigate(['/doc/' + this.docId])
  }

}
