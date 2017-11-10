import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { filter, first } from 'rxjs/operators'

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
      return this.profileService.onProfile.pipe(
        filter((profile) => profile !== undefined),
        first()
      ).toPromise()
    }
  }
}
