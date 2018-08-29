import { BreakpointObserver } from '@angular/cdk/layout'
import { ChangeDetectionStrategy, Component, Injectable, OnDestroy } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { UiService } from '../core/ui/ui.service'
import { RichCollaboratorsService } from '../doc/rich-collaborators'
import { DocService } from './doc.service'
import { LogsService } from './logs/logs.service'
import { NetworkService } from './network'

export enum VIEWPORT {
  LARGE,
  MEDIUM,
  SMALL,
  EXTRASMALL,
}

@Component({
  selector: 'mute-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [LogsService, DocService, NetworkService, RichCollaboratorsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Injectable()
export class DocComponent implements OnDestroy {
  public viewport: Observable<VIEWPORT>
  public drawerMode: BehaviorSubject<string>
  public drawerOpened: BehaviorSubject<boolean>
  public extrasmall: string

  private subs: Subscription[]

  constructor(private router: Router, private breakpointObserver: BreakpointObserver, public docService: DocService, public ui: UiService) {
    this.drawerMode = new BehaviorSubject('')
    this.drawerOpened = new BehaviorSubject(false)
    this.extrasmall = ''
    this.subs = []
    this.subs[this.subs.length] = merge(
      this.breakpointObserver.observe(['(min-width: 1450px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.LARGE)
      ),
      this.breakpointObserver.observe(['(min-width: 1130px) and (max-width: 1450px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.MEDIUM)
      ),
      this.breakpointObserver.observe(['(min-width: 800px) and (max-width: 1130px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.SMALL)
      ),
      this.breakpointObserver.observe(['(max-width: 800px)']).pipe(
        filter((result) => result.matches),
        map(() => VIEWPORT.EXTRASMALL)
      )
    ).subscribe((viewport) => {
      switch (viewport) {
        case VIEWPORT.LARGE:
          this.drawerMode.next('over')
          this.drawerOpened.next(true)
          this.extrasmall = ''
          break
        case VIEWPORT.MEDIUM:
          this.drawerMode.next('side')
          this.drawerOpened.next(true)
          this.extrasmall = ''
          break
        case VIEWPORT.SMALL:
          this.drawerMode.next('push')
          this.drawerOpened.next(false)
          this.extrasmall = ''
          break
        case VIEWPORT.EXTRASMALL:
          this.drawerMode.next('push')
          this.drawerOpened.next(false)
          this.extrasmall = 'extrasmall'
          break
      }
    })

    // The following code force to destroy and recreate all components/services/directives etc.
    // in order when the user creates a new document. Otherwise doc changes, but all angular components
    // remain the same which leads to many bugs.
    this.router.routeReuseStrategy.shouldReuseRoute = () => false
    this.subs[this.subs.length] = this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false
      }
    })
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  editorReady() {
    this.docService.joinSession()
  }

  async saveDoc() {
    await this.docService.doc.saveMetadata()
    await this.docService.doc.saveContent(this.docService.getDocContent())
  }
}
