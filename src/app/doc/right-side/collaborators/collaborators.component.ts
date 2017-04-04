import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core'
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'
import { RichCollaboratorsService } from '../../../doc/rich-collaborators'
import { Subscription } from 'rxjs/Rx'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('peerArriving', [
      state('active', style({transform: 'translateX(0)'})),
      state('void', style({transform: 'translateX(100%)'})),
      transition(':enter', animate('100ms ease-in')),
      transition(':leave', animate('100ms ease-out'))
    ])
  ]
})
export class CollaboratorsComponent implements OnInit, OnDestroy {

  private onChangeSubs: Subscription
  private onJoinSubs: Subscription
  private onLeaveSubs: Subscription

  constructor (
    private collabService: RichCollaboratorsService,
    private detectorRef: ChangeDetectorRef
  ) {}

  ngOnInit (): void {
    this.onChangeSubs = this.collabService.onChange.subscribe(
      () => this.detectorRef.markForCheck()
    )
    this.onJoinSubs = this.collabService.onJoin.subscribe(
      () => this.detectorRef.markForCheck()
    )
    this.onLeaveSubs = this.collabService.onLeave.subscribe(
      () => this.detectorRef.markForCheck()
    )
  }

  ngOnDestroy () {
    this.onChangeSubs.unsubscribe()
    this.onJoinSubs.unsubscribe()
    this.onLeaveSubs.unsubscribe()
  }
}
