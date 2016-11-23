import { Component, OnInit } from '@angular/core'

import { CollaboratorsService } from '../../core/collaborators/collaborators.service'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  private collabService: CollaboratorsService
  private collaborators: Array<Object>

  constructor(collabService: CollaboratorsService) {
    this.collabService = collabService
    this.collaborators = new Array<Object>()
  }

  ngOnInit() {
    this.collabService.onJoin.subscribe((obj: any) => {
      this.collaborators = Array.from(this.collabService.getCollaborators().values())
    })

    this.collabService.onLeave.subscribe((obj: any) => {
      this.collaborators = Array.from(this.collabService.getCollaborators().values())
    })

    this.collabService.onPseudoChange.subscribe((obj: any) => {
      this.collaborators = Array.from(this.collabService.getCollaborators().values())
    })
  }
}
