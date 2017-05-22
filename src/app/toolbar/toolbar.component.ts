import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { Router } from '@angular/router'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input('state') state

  public rootFileTitle: Observable<string>

  constructor (
    public ui: UiService,
    private router: Router,
    public profile: ProfileService
  ) { }

  ngOnInit () {
    this.rootFileTitle = this.ui.onActiveFile
      .filter((file) => file !== null)
      .pluck('title')
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
