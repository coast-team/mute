import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'mute-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
@Injectable()
export class TimelineComponent implements OnInit {

  @Input() currentOp: number
  @Input() nbOperations: number
  @Output() onSlide: EventEmitter<Number>
  step: number

  constructor () {
    this.onSlide = new EventEmitter<number>()
  }

  ngOnInit () {
    this.step = 1
  }

  updateOperation (event: any) {
    this.currentOp = event.value
    this.onSlide.emit(this.currentOp)
  }

  updateStep (event: any) {
    this.step = event.value <= 0 ? 1 : event.value
  }

}
