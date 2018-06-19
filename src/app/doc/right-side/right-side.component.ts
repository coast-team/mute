import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'

import { MetaDataType } from 'mute-core'
import { Doc } from '../../core/Doc'
import { RichCollaboratorsService } from '../../doc/rich-collaborators'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss'],
})
export class RightSideComponent implements OnInit, OnDestroy {
  @Input() doc: Doc

  private subs: Subscription[]

  constructor(private cd: ChangeDetectorRef, public collabService: RichCollaboratorsService) {
    this.subs = []
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.doc.onDocChange.subscribe((type: MetaDataType) => {
      if (type === MetaDataType.FixData) {
        this.cd.detectChanges()
      }
    })
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe())
  }
}
