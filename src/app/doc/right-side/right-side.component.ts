import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators'

import { Doc } from '../../core/Doc'
import { SettingsService } from '../../core/settings/settings.service'
import { RichCollaborator, RichCollaboratorsService } from '../../doc/rich-collaborators'

@Component({
  selector: 'mute-right-side',
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.scss']
})
export class RightSideComponent implements OnInit {

  public storageIcons: string[]
  public collaborators: RichCollaborator[]
  @Input() doc: Doc
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
    private cd: ChangeDetectorRef,
    private collabService: RichCollaboratorsService,
    public settings: SettingsService
  ) {
    this.collaborators = this.collabService.collaborators
  }

  ngOnInit () {
    this.collabService.onUpdate.subscribe((collab: RichCollaborator) => {
      this.collaborators = this.collabService.collaborators
      this.cd.detectChanges()
    })
  }

  updateDisplayName (displayName: string) {
    this.settings.profile.displayName = displayName
  }
}
