import { Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { Subscription, timer } from 'rxjs'

@Component({
  selector: 'mute-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
@Injectable()
export class TimelineComponent implements OnInit, OnDestroy {
  @Input()
  currentOp: number
  @Input()
  delay: number
  @Input()
  nbOperations: number
  @Input()
  max: number
  @Input()
  step: number
  @Output()
  slide: EventEmitter<number>

  player: any
  private subscriptionPlayer: Subscription
  stepSize: number

  constructor() {
    this.slide = new EventEmitter<number>()
  }

  ngOnInit() {
    this.step = 1
    this.stepSize = 1
    this.player = timer(0, this.delay)
  }

  updateOperation(newOp: number) {
    if (newOp <= this.nbOperations) {
      this.currentOp = newOp
    } else {
      this.currentOp = this.nbOperations
      this.pause()
    }
    this.slide.emit(this.currentOp)
  }

  play() {
    this.subscriptionPlayer = this.player.subscribe(() => {
      this.updateOperation(this.currentOp + this.step)
    })
  }

  pause() {
    this.subscriptionPlayer.unsubscribe()
  }

  goToBegin() {
    this.currentOp = 0
    this.slide.emit(this.currentOp)
  }

  goToEnd() {
    this.currentOp = this.nbOperations
    this.slide.emit(this.currentOp)
  }

  ngOnDestroy() {
    if (this.subscriptionPlayer) {
      this.pause()
    }
  }
}
