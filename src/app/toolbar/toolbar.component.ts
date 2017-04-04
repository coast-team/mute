import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Rx'

import { UiService } from '../core/ui/ui.service'
import { ProfileService } from '../core/profile/profile.service'
import { Doc } from '../core/Doc'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit {

  public rootFileTitle: Observable<string>

  constructor (
    private router: Router,
    public ui: UiService,
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
    const doc = this.ui.activeFile as Doc
    doc.title = title
    doc.save()
  }

}
