import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { CollaboratorsService } from '../../../core/collaborators'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  constructor(
    private collabService: CollaboratorsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.collabService.onJoin.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })

    this.collabService.onLeave.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })

    this.collabService.onPseudo.subscribe(() => {
      this.changeDetectorRef.detectChanges()
    })
  }
}
