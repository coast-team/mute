import { Component, Input } from '@angular/core'

import { Doc } from '../../core/Doc'
import { RichCollaboratorsService } from '../../doc/rich-collaborators'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss'],
})
export class RightSideComponent {
  @Input() doc: Doc

  constructor(private collabService: RichCollaboratorsService) {}
}
