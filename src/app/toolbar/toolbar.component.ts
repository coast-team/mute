import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core'
import { Observable, Subject } from 'rxjs/Rx'
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

  private serviceWorker: ServiceWorkerRegister
  private snackBarSubject: Subject<string>

  constructor (
    public ui: UiService,
    private network: NetworkService,
    private router: Router,
    public profile: ProfileService,
    private snackBar: MdSnackBar,
    private connectivity: ConnectivityService
  ) {
    this.snackBarSubject = new Subject()
    this.serviceWorker = new ServiceWorkerRegister
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
      } else {
        this.snackBarSubject.next('You are offline')
      }
    })

    this.serviceWorker.registerSW()

    this.serviceWorker.observableState.subscribe((message) => {
      this.snackBarSubject.next(message)
    })

  }

  isDocs () {
    return this.router.url.includes('/docs')
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
