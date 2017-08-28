import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { Observable, Subject, Subscription } from 'rxjs/Rx'
import { Router } from '@angular/router'
import { WebChannel } from 'netflux'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'
import { NetworkService } from '../doc/network/network.service'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input('state') state

  public SYNC = 1
  public SYNC_DISABLED = 2
  public SYNC_PROBLEM = 3
  public rootFileTitle: Observable<string>

  // Here add subscription
  public syncIcon: number
  public signalingStatus: boolean
  public onLineStatus: boolean
  public networkStatus: boolean

  constructor (
    public ui: UiService,
    private networkService: NetworkService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    public profile: ProfileService
  ) {
    this.signalingStatus = undefined
    this.onLineStatus = undefined
    this.networkStatus = undefined
  }

  ngOnInit () {
    this.rootFileTitle = this.ui.onActiveFile
      .filter((file) => file !== null)
      .pluck('title')

    this.networkService.onStateChange.subscribe((state: number) => {
      log.info('NetworkState', state)
      if (navigator.onLine) {
        if (state === WebChannel.JOINED) {
          this.syncIcon = this.SYNC
        } else {
          this.syncIcon = undefined
        }
        this.changeDetectorRef.detectChanges()
      }
    })

    this.networkService.onSignalingStateChange.subscribe((state: number) => {
      log.info('SignalingState', state)
      if (navigator.onLine && this.syncIcon !== undefined && state !== WebChannel.SIGNALING_READY_TO_JOIN_OTHERS) {
        this.syncIcon = undefined
        this.changeDetectorRef.detectChanges()
      }
    })

    this.networkService.onLine.subscribe((online: boolean) => {
      log.info('ONLINE/OFFLINE', 'Is online ' + online)
      if (!online) {
        this.syncIcon = this.SYNC_PROBLEM
        this.changeDetectorRef.detectChanges()
      }
    })

  }


  isDocs () {
    return this.router.url.includes('/docs')
  }

  isDoc () {
    return this.router.url.includes('/doc/') && !this.router.url.includes('/history/')
  }

  isHistory () {
    return this.router.url.includes('history')
  }

  updatePseudo (pseudo: string) {
    this.profile.pseudonym = pseudo
  }

  updateTitle (title: string) {
    const doc = this.ui.activeFile as any
    doc.title = title
    doc.save()
  }

}
