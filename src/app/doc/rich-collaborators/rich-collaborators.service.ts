import { Injectable, NgZone } from '@angular/core'
import { Observable } from 'rxjs'

import { Collaborator } from 'mute-core'
import { RichCollaborator } from './RichCollaborator'

import * as randomMC from 'random-material-color'


@Injectable()
export class RichCollaboratorsService {

  private colors: Map<number, string>
  public collaborators: RichCollaborator[]

  constructor (
    private ngZone: NgZone
  ) {
    console.log('Constructeur RichCollaboratorsService')
    this.colors = new Map()
    this.collaborators = []
  }

  set collaboratorsSource(source: Observable<Collaborator[]>) {
    source.subscribe((collaborators: Collaborator[]) => {
      this.ngZone.run(() => {
        this.collaborators = collaborators.map((collaborator: Collaborator) => {
          const color: string = this.getColor(collaborator.id)
          return new RichCollaborator(collaborator.id, collaborator.pseudo, color)
        })
      })
    })
  }

  getColor (id: number): string {
    if (this.colors.has(id)) {
      return this.colors.get(id) as string
    } else {
      const color: string = randomMC.getColor({ shades: ['900', '800'] })
      this.colors.set(id, color)
      return color
    }
  }
}
