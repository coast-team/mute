import { Component, OnInit, OnDestroy, Injectable, Input, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'

@Component({
  selector: 'mute-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
@Injectable()
export class TimelineComponent implements OnInit, OnDestroy {

  @Input() currentOp: number
  @Input() delay: number
  @Input() nbOperations: number
  @Output() onSlide: EventEmitter<Number>
  player: any
  private subscriptionPlayer: Subscription
  step: number

  constructor () {
    this.onSlide = new EventEmitter<number>()
  }

  ngOnInit () {
    this.step = 1
    this.player = Observable.timer(0, this.delay)
  }

  updateOperation (newOp: number) {
    if (newOp <= this.nbOperations) {
      this.currentOp = newOp
    } else {
      this.currentOp = this.nbOperations
      this.pause()
    }
    this.onSlide.emit(this.currentOp)
  }

  play () {
    this.subscriptionPlayer = this.player.subscribe( (t) => this.updateOperation(this.currentOp + this.step))
  }

  pause ( ) {
    this.subscriptionPlayer.unsubscribe()
  }

  goToBegin () {
    this.currentOp = 1
    this.onSlide.emit(this.currentOp)
  }

  goToEnd () {
    this.currentOp = this.nbOperations
    this.onSlide.emit(this.currentOp)
  }

  ngOnDestroy () {
    this.pause()
  }

  updateStep (event: any) {
    this.step = event.value <= 0 ? 1 : event.value
  }

}
