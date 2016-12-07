import { Component, OnInit } from '@angular/core'

import { CollaboratorsService, Collaborator } from '../../../core/collaborators'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  private collabService: CollaboratorsService

  public collaborators: Array<Collaborator>

  constructor(collabService: CollaboratorsService) {
    this.collabService = collabService
  }

  ngOnInit() {}
}
