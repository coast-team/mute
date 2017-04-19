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

  constructor () {
    this.onSlide = new EventEmitter<number>()
  }

  ngOnInit () {}

  updateOperation (event: any) {
    this.currentOp = event.value
    this.onSlide.emit(this.currentOp)
  }

}
