import { Component, OnInit } from '@angular/core'
import * as randomMC from 'random-material-color'

import { NetworkService } from '../core/network/network.service'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  private network: NetworkService
  private collaborators: Set<Collaborator> = new Set<Collaborator>()

  constructor(network: NetworkService) {
    this.network = network
  }

  ngOnInit() {
    this.network.onPeerJoin.subscribe((id) => {
      this.collaborators.add(
        new Collaborator(id, 'Anonymous', randomMC.getColor({ shades: ['200', '300']}))
      )
    })

    this.network.onPeerLeave.subscribe((id) => {
      // For of loop was used here instead of forEach, but it seams to be an
      // old Typescript issue in case when we target es5.
      this.collaborators.forEach((value) => {
        if (value.id === id) {
          this.collaborators.delete(value)
        }
      })
    })

    this.network.onPeerPseudo.subscribe(({id, pseudo}: {id: number, pseudo: string}) => {
      this.collaborators.forEach((value) => {
        if (value.id === id) {
          value.pseudo = pseudo
        }
      })
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
