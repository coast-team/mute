import { Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, UrlSegment } from '@angular/router'

import { ProfileService } from '../core/profile/profile.service'

@Component({
  selector: 'mute-leftside',
  templateUrl: './leftside.component.html',
  styleUrls: ['./leftside.component.scss'],
  providers: [ProfileService]
})
export class LeftsideComponent implements OnInit {

  private route: ActivatedRoute
  private profileService: ProfileService

  @ViewChild('sidenavElm') sidenavElm
  @ViewChild('pseudonymElm') pseudonymElm
  pseudonym: string

  constructor (route: ActivatedRoute, profileService: ProfileService) {
    this.route = route
    this.profileService = profileService
  }

  ngOnInit () {
    this.pseudonymElm.value = this.profileService.pseudonym
    this.route.url.forEach((urlFrag: UrlSegment[]) => {
      if (urlFrag[0].path === '') {
        setTimeout(() => {
          this.sidenavElm.open()
        }, 1500)
      }
    })

  }

  toggleSidenav () {
    this.sidenavElm.toggle()
  }

  updatePseudonym (event) {
    this.profileService.pseudonym = event.target.value
    if (event.target.value === '') {
      this.pseudonymElm.value = this.profileService.pseudonym
    }
  }
}
