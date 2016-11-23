import { Component, OnInit } from '@angular/core'

import { CollaboratorsService } from '../../core/collaborators/collaborators.service'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  private collabService: CollaboratorsService
  private collaborators: Array<Collaborator>

  constructor(collabService: CollaboratorsService) {
    this.collabService = collabService
    this.collaborators = new Array<Collaborator>()
  }

  ngOnInit() {
    this.collabService.onJoin.subscribe(({id, pseudo, color}: {id: number, pseudo: string, color: string}) => {
      let collab = new Collaborator(id, pseudo, color)
      this.collaborators[this.collaborators.length] = collab
    })

    this.collabService.onLeave.subscribe((id: number) => {
      for (let i = 0; i < this.collaborators.length; i++) {
        if (this.collaborators[i].id === id) {
          this.collaborators.splice(i, 1)
          break
        }
      }
    })

    this.collabService.onPseudoChange.subscribe(({id, pseudo}: {id: number, pseudo: string}) => {
      for (let i = 0; i < this.collaborators.length; i++) {
        if (this.collaborators[i].id === id) {
          this.collaborators[i].pseudo = pseudo
          break
        }
      }
    })
  }

}


class Collaborator {
  public id: number
  public pseudo: string
  public color: string

  constructor (id: number, pseudo: string, color: string) {
    this.id = id
    this.pseudo = pseudo
    this.color = color
  }
}
