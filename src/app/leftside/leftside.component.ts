import { Component, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'

import { ProfileService } from '../core/profile/profile.service'

@Component({
  selector: 'mute-leftside',
  templateUrl: './leftside.component.html',
  styleUrls: ['./leftside.component.scss']
})
export class LeftsideComponent implements OnInit {

  private route: ActivatedRoute
  private router: Router
  private profileService: ProfileService

  @ViewChild('sidenavElm') sidenavElm
  @ViewChild('pseudonymElm') pseudonymElm
  pseudonym: string

  constructor (router: Router, route: ActivatedRoute, profileService: ProfileService) {
    this.router = router
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

  newDoc () {
    const MIN_LENGTH = 10
    const DELTA_LENGTH = 0
    const MASK = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    const length = MIN_LENGTH + Math.round(Math.random() * DELTA_LENGTH)

    for (let i = 0; i < length; i++) {
      key += MASK[Math.round(Math.random() * (MASK.length - 1))]
    }
    this.router.navigate(['/' + key])
  }
}
