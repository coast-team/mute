import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core'
import { Observable, Subject } from 'rxjs/Rx'
import { Router } from '@angular/router'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'
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

  private serviceWorker: ServiceWorkerRegister
  private snackBarSubject: Subject<string>

  constructor (
    public ui: UiService,
    private router: Router,
    public profile: ProfileService,
    private snackBar: MdSnackBar
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

    this.serviceWorker.registerSW()

    this.serviceWorker.observableState.subscribe((message) => {
      this.snackBarSubject.next(message)
    })

  }

  isDocs () {
    return this.router.url.includes('/docs')
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
