import {  ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { ObservableMedia } from '@angular/flex-layout'
import { ResolveEnd, Router } from '@angular/router'
import { AuthService } from 'ng2-ui-auth'

import { Profile } from '../core/profile/Profile'
import { ProfileService } from '../core/profile/profile.service'
import { StorageService } from '../core/storage/storage.service'
import { UiService } from '../core/ui/ui.service'
import { NetworkService } from '../doc/network/network.service'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @ViewChild('inputTitle') public inputTitle: ElementRef

  public rootFileTitle: string
  public routeName: string
  public profile: Profile

  // Here add subscription
  public detailsVisible = false

  constructor (
    public ui: UiService,
    private networkService: NetworkService,
    private router: Router,
    private storage: StorageService,
    private changeDetectorRef: ChangeDetectorRef,
    private auth: AuthService,
    public profileService: ProfileService,
    public media: ObservableMedia,
  ) {
    this.profile = this.profileService.profile
    this.rootFileTitle = ''
  }

  ngOnInit () {

    this.profileService.onProfile.subscribe((profile: Profile) => {
      this.profile = profile
    })

    this.router.events
      .filter((event) => event instanceof ResolveEnd)
      .subscribe((event: ResolveEnd) => {
        this.routeName = this.routeNameFromUrl(event.url)
        this.rootFileTitle = this.ui.activeFile.title
      })
  }

  updateTitle (event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.inputTitle.nativeElement.blur()
    } else if (event.type === 'blur') {
      const doc = this.ui.activeFile as any
      const newTitle = this.inputTitle.nativeElement.value
      if (doc.title !== newTitle) {
        if (newTitle === '') {
          doc.title = 'Untitled document'
          this.inputTitle.nativeElement.value = doc.title
        } else {
          doc.title = newTitle
        }
        this.storage.updateFile(doc)
      }
    }
  }

  selectTitle () {
    this.inputTitle.nativeElement.select()
  }

  private routeNameFromUrl (url: string) {
    if (['/', '/trash'].includes(url)) {
      return 'docs'
    } else if (url.startsWith('/history')) {
      return 'history'
    } else {
      return 'doc'
    }
  }
}
