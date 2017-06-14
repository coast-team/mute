import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Params } from '@angular/router'

import { NetworkService } from '../../doc/network'
import { ProfileService } from '../../core/profile/profile.service'
import { LocalStorageService } from '../../core/storage/local-storage/local-storage.service'
import { BotStorageService } from '../../core/storage/bot-storage/bot-storage.service'
import { Doc } from '../../core/Doc'
import { RichCollaboratorsService } from '../../doc/rich-collaborators'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss']
})
export class RightSideComponent implements OnDestroy, OnInit {

  private onDoorSubscription: Subscription

  public storageIcons: string[]
  public signalingOk: boolean
  public onLineOk: boolean
  public networkOk: boolean
  public collaborators: any
  public docKey: string

  constructor (
    private route: ActivatedRoute,
    private collabService: RichCollaboratorsService,
    private changeDetectorRef: ChangeDetectorRef,
    private localStorage: LocalStorageService,
    private botStorage: BotStorageService,
    private networkService: NetworkService,
    public profile: ProfileService
  ) {
    this.storageIcons = []
    this.signalingOk = false
    this.networkOk = false
    this.onLineOk = false
    this.collaborators = collabService.onCollaborators
  }

  ngOnInit () {
    this.route.data.subscribe(({doc}: {doc: Doc}) => {
      doc.isSaved()
        .then(() => {
          this.storageIcons = doc.getStorageIcons()
          this.docKey = doc.id
        })
    })
    this.onDoorSubscription = this.networkService.onDoor.subscribe((opened) => {
      this.signalingOk = opened
      this.changeDetectorRef.detectChanges()
    })

    this.networkService.onLine.subscribe((event) => {
      this.onLineOk = true
    })

    this.networkService.onJoin.subscribe((event) => {
      this.networkOk = true
    })
  }

  ngOnDestroy () {
    this.onDoorSubscription.unsubscribe()
  }

  toggleDoor () {
    // this.networkService.openDoor(!this.doorOpened)
  }

  updatePseudo (pseudo: string) {
    this.profile.pseudonym = pseudo
  }
}
