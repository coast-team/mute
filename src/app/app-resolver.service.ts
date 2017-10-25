import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'

import { Profile } from './core/profile/Profile'
import { ProfileService } from './core/profile/profile.service'

@Injectable()
export class AppResolverService implements Resolve<Profile> {

  constructor (
    private profileService: ProfileService
  ) {}

  resolve (route: ActivatedRouteSnapshot): Promise<Profile> {
    if (this.profileService.profile) {
      return Promise.resolve(this.profileService.profile)
    } else {
      log.debug('App resolver: ')
      return this.profileService.onProfile
        .filter((profile) => {
          log.debug('new profile: ', profile)
          return profile !== undefined
        })
        .first()
        .toPromise()
    }
  }
}
