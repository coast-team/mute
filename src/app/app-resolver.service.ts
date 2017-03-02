import { Injectable }             from '@angular/core'
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router'

import { UiService } from './core/ui/ui.service'
import { File } from './core/File'

@Injectable()
export class AppResolverService implements Resolve<string> {

  constructor (
    private ui: UiService,
    private router: Router
  ) {}

  resolve (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<string> {
    log.debug('Shapshot: ', route)
    return Promise.resolve('hello world')
    // let id = route.params['id']
    // return this.cs.getCrisis(id).then(crisis => {
    //   if (crisis) {
    //     return crisis;
    //   } else { // id not found
    //     this.router.navigate(['/crisis-center']);
    //     return null;
    //   }
    // });
  }
}
