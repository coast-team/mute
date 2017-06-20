import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { Observable, Subject, Subscription } from 'rxjs/Rx'
import { Router } from '@angular/router'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'
import { NetworkService } from '../doc/network/network.service'
import { ServiceWorkerRegister } from '../core/ServiceWorkerRegister'
import { ConnectivityService } from '../core/connectivity/connectivity.service'

import { MdSnackBar, MdMenuTrigger, MdMenu } from '@angular/material'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  providers: [ConnectivityService]
})
export class ToolbarComponent implements OnInit {

  @Input('state') state

  public rootFileTitle: Observable<string>

  private onDoorSubscription: Subscription
  private serviceWorker: ServiceWorkerRegister
  private snackBarSubject: Subject<string>
  public connectionState: boolean
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
    private connectivity: ConnectivityService
  ) {
    this.snackBarSubject = new Subject()
    this.serviceWorker = new ServiceWorkerRegister
    this.connectionState = undefined
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

    this.connectivity.launchTest()

    this.connectivity.onLine.subscribe((state) => {
      if (state) {
        this.snackBarSubject.next('You are online')
        this.onLineStatus = true
      } else {
        this.snackBarSubject.next('You are offline')
        this.onLineStatus = false
        this.signalingStatus = false
        this.networkStatus = false
      }
      this.updateConnectionState()
    })

    this.serviceWorker.registerSW()

    this.serviceWorker.observableState.subscribe((message) => {
      this.snackBarSubject.next(message)
    })

    this.onDoorSubscription = this.networkService.onDoor.subscribe((opened) => {
      this.signalingStatus = opened
      if (opened === false && this.networkStatus === undefined) {
        this.networkStatus = false
      }
      if (opened === true) {
        this.onLineStatus = true
      }
      this.changeDetectorRef.detectChanges()
      this.updateConnectionState()
    })

    this.networkService.onLine.subscribe((event) => {
      this.onLineStatus = event.valueOf()
      if (event.valueOf() === false) {
        this.networkStatus = false
        this.signalingStatus = false
      }
      this.updateConnectionState()
    })

    this.networkService.onJoin.subscribe((event) => {
      this.networkStatus = true
      this.updateConnectionState()
    })

  }


  isDocs () {
    return this.router.url.includes('/docs')
  }

  isDoc () {
    return this.router.url.includes('/doc/')
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

  updateConnectionState () {
    if (this.signalingStatus && this.onLineStatus && this.networkStatus) {
        this.connectionState = true
      } else if (this.signalingStatus === undefined ||
        this.signalingStatus === undefined ||
        this.signalingStatus === undefined) {
          this.connectionState = undefined
      } else {
        this.connectionState = false
      }
  }

}
