import { Component, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs/Rx'

import { environment } from '../environments/environment'
import { UiService } from './core/ui/ui.service'
import { ProfileService } from './core/profile/profile.service'
import { File } from './core/File'

@Component({
  selector: 'mute-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('toolbarElm') toolbarElm
  @ViewChild('leftSidenavElm') leftSidenavElm
  public visible: boolean
  public rootFileTitle: Observable<string>
  public innerWidth = window.innerWidth

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    public ui: UiService,
    public profile: ProfileService
  ) {
    this.visible = environment.devLabel
    this.rootFileTitle = this.ui.onActiveFile
      .filter((file) => file !== null)
      .pluck('title')
  }

  ngOnInit () {
    this.route.data
      .subscribe((data: {file: string}) => {
        log.debug('File: ', data)
      })
    this.leftSidenavElm.onClose.subscribe(() => {
      this.ui.navOpened = false
    })
    this.ui.onNavToggle.subscribe((open: boolean) => {
      this.leftSidenavElm.opened = open
    })
    this.ui.openNav()
  }

  isDoc () {
    // FIXME: find better way to distinguish 'doc' from 'docs'
    return !this.router.url.includes('/docs')
  }

  updatePseudo (pseudo: string) {
    this.profile.pseudonym = pseudo
  }

  updateTitle (title: string) {
    log.debug('New title: ' + title)
  }
}
