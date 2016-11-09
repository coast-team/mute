import { Component, OnInit } from '@angular/core';
import * as randomMC from 'random-material-color'

import { NetworkService } from '../core/network/network.service'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  private collaborators: Set<Collaborator> = new Set<Collaborator>()

  constructor(private network: NetworkService) { }

  ngOnInit() {
    this.network.peerJoin.subscribe(id => {
      console.log('add id: ' + id)
      this.collaborators.add(
        new Collaborator(id, 'Anonymous', randomMC.getColor({ shades: ['200', '300']}))
      )
    })

    this.network.peerLeave.subscribe(id => {
      console.log('peer leaving...')
      for (let c of this.collaborators) {
        // console.log('del id: ' + c.id)
        if (c.id === id) {
          console.log('deleting...')
          this.collaborators.delete(c)
          break
        }
      }
    })

    this.network.peerPseudo.subscribe((obj: any) => {
      for (let c of this.collaborators) {
        // console.log('del id: ' + c.id)
        if (c.id === obj.id) {
          c.pseudonym = obj.pseudo
          break
        }
      }
    })
  }

}


class Collaborator {
  constructor (
    public id: number,
    public pseudonym: string,
    public color: string
  ) {}
}
