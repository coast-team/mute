import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators'
import { Subscription } from 'rxjs/Subscription'

import { Doc } from '../../core/Doc'
import { SettingsService } from '../../core/settings/settings.service'
import { RichCollaborator, RichCollaboratorsService } from '../../doc/rich-collaborators'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss'],
})
export class RightSideComponent implements OnInit, OnDestroy {
  @Input() doc: Doc

  private subs: Subscription[]

  public storageIcons: string[]
  public collaborators: RichCollaborator[]

  constructor(private cd: ChangeDetectorRef, private collabService: RichCollaboratorsService, public settings: SettingsService) {
    this.collaborators = this.collabService.collaborators
    this.subs = []
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.collabService.onUpdate.subscribe((collab: RichCollaborator) => {
      this.collaborators = this.collabService.collaborators
      this.cd.detectChanges()
    })

    this.subs[this.subs.length] = this.collabService.onLeave.subscribe((id: number) => {
      this.collaborators = this.collabService.collaborators
      this.cd.detectChanges()
    })
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe())
  }

  updateDisplayName(displayName: string) {
    this.settings.profile.displayName = displayName
  }
}
