import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { Observable, Subject, Subscription } from 'rxjs/Rx'
import { Router } from '@angular/router'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'
import { NetworkService } from '../doc/network/network.service'
import { ServiceWorkerRegister } from '../core/ServiceWorkerRegister'

import { MdSnackBar, MdMenuTrigger, MdMenu } from '@angular/material'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input('state') state

  public rootFileTitle: Observable<string>

  private onDoorSubscription: Subscription

  // Here add subscription
  private serviceWorker: ServiceWorkerRegister
  private snackBarSubject: Subject<string>
  public signalingStatus: boolean
  public onLineStatus: boolean
  public networkStatus: boolean

  constructor (
    public ui: UiService,
    private networkService: NetworkService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    public profile: ProfileService,
    private snackBar: MdSnackBar,
  ) {
    this.snackBarSubject = new Subject()
    this.serviceWorker = new ServiceWorkerRegister
    this.signalingStatus = undefined
    this.onLineStatus = undefined
    this.networkStatus = undefined
  }

  ngOnInit () {
    this.rootFileTitle = this.ui.onActiveFile
      .filter((file) => file !== null)
      .pluck('title')

    this.snackBarSubject
      .throttleTime(500)
      .subscribe((message: string) => {
        this.snackBar.open(message, 'close', {
          duration: 5000
        })
      })

    this.serviceWorker.registerSW()

    this.serviceWorker.observableState.subscribe((message) => {
      this.snackBarSubject.next(message)
    })

    this.networkService.onSignalingStateChange.subscribe((event) => {
      if (event === 0) {
        this.signalingStatus = undefined
      } else if ((event === 1) || (event === 3)) {
        this.signalingStatus = true
      } else {
        this.signalingStatus = false
      }
    })

    this.networkService.onStateChange.subscribe((event) => {
      if (event === 0) {
        this.networkStatus = undefined
      } else if (event === 1) {
        this.networkStatus = true
      } else {
        this.networkStatus = false
      }
    })

    this.networkService.onLine.subscribe((event) => {
      this.onLineStatus = event
    })

    this.networkService.launchTest()

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
