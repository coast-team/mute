import { Component } from '@angular/core'

import { Doc } from '../../core/Doc'
import { RichCollaboratorsService } from '../../doc/rich-collaborators'
import { DocService } from '../doc.service'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss'],
})
export class RightSideComponent {
  public doc: Doc

  constructor(docService: DocService, public collabService: RichCollaboratorsService) {
    this.doc = docService.doc
  }
}
