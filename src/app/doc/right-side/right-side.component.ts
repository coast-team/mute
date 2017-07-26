import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'
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
  public collaborators: any
  public docKey: string
  public headers: any[] = [
    {md: 'Header', s: '# Header', class: 'header-1 header-1::after'},
    {md: 'Header', s: '## Header', class: 'header-2 header-2::after'},
    {md: 'Header', s: '### Header', class: 'header-3'},
    {md: 'Header', s: '#### Header', class: 'header-4'},
    {md: 'Header', s: '##### Header', class: 'header-5'}
  ]
  public styles: any[] = [
    {md: 'Italic', s: '*Italic* _Italic_', class: 'italic'},
    {md: 'Strong', s: '**Strong** __Strong__', class: 'strong'},
    {md: 'Strikethrough', s: '~~Strikethrough~~', class: 'strikethrough'}
  ]
  public lists: any[] = [
    {md: '1. Numbered list', s: '1. Numbered list', class: 'list'},
    {md: ' * Bulleted list', s: '* Bulleted list', class: 'list'},
    {md: '- Bulleted list', s: '- Bulleted list', class: 'list'},
    {md: ' + Bulleted list', s: '+ Bulleted list', class: 'list'},
    {md: '- [ ] Check list', s: '- [ ] Check list', class: 'check-list'}
  ]
  public other: any[] = [
    {md: 'code', s: '`code`', class: 'inline-code'},
    {md: '```code```', s: '```code```'},
    {md: 'Quotation', s: '> Quotation', class: 'quotation quotation::before'}
  ]


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
      this.changeDetectorRef.detectChanges()
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
