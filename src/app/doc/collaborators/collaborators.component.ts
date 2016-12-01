import { Component, OnInit, ChangeDetectorRef } from '@angular/core'

import { CollaboratorsService } from '../../core/collaborators/collaborators.service'

@Component({
  selector: 'mute-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  private changeDetectorRef: ChangeDetectorRef
  private collabService: CollaboratorsService
  private collaborators: Array<Collaborator>

  constructor(collabService: CollaboratorsService, changeDetectorRef: ChangeDetectorRef) {
    this.changeDetectorRef = changeDetectorRef
    this.collabService = collabService
    this.collaborators = new Array<Collaborator>()
  }

  ngOnInit() {
    this.collabService.onJoin.subscribe(({id, pseudo, color}: {id: number, pseudo: string, color: string}) => {
      this.collaborators.push(new Collaborator(id, pseudo, color))
      this.changeDetectorRef.detectChanges()
    })

    this.collabService.onLeave.subscribe((id: number) => {
      for (let i = 0; i < this.collaborators.length; i++) {
        if (this.collaborators[i].id === id) {
          this.collaborators.splice(i, 1)
          break
        }
      }
      this.changeDetectorRef.detectChanges()
    })

    this.collabService.onPseudoChange.subscribe(({id, pseudo}: {id: number, pseudo: string}) => {
      for (let i = 0; i < this.collaborators.length; i++) {
        if (this.collaborators[i].id === id) {
          this.collaborators[i].pseudo = pseudo
          break
        }
      }
      this.changeDetectorRef.detectChanges()
    })
  }
}

class Collaborator {
  public id: number
  public pseudo: string
  public color: string

  constructor (id, pseudo, color) {
  this.id = id
    this.pseudo = pseudo
    this.color = color
  }
}
