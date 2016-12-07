import { Component, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'

import { ProfileService } from '../core/profile/profile.service'
import { BotStorageService } from '../core/bot-storage/bot-storage.service'
import { environment } from '../../environments/environment'

@Component({
  selector: 'mute-leftside',
  templateUrl: './leftside.component.html',
  styleUrls: ['./leftside.component.scss']
})
export class LeftsideComponent implements OnInit {

  private route: ActivatedRoute
  private router: Router
  private profileService: ProfileService
  private botStorageService: BotStorageService
  private available: boolean
  private tooltipMsg: string

  @ViewChild('sidenavElm') sidenavElm
  @ViewChild('pseudonymElm') pseudonymElm
  pseudonym: string

  constructor (
    router: Router,
    route: ActivatedRoute,
    botStorageService: BotStorageService,
    profileService: ProfileService
  ) {
    this.router = router
    this.route = route
    this.botStorageService = botStorageService
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
    this.botStorageService.reachable(environment.botStorageURL)
      .then(() => {
        this.available = true
        this.tooltipMsg = `Is available on: ${environment.botStorageURL}`
      })
      .catch(() => {
        this.available = false
        this.tooltipMsg = `${environment.botStorageURL} is not available`
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

  showTooltip () {

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
