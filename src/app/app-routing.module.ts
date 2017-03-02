import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AppResolverService } from './app-resolver.service'

const routes: Routes = [
  { path: '**', redirectTo: '/docs/all' }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: [ AppResolverService ]
})
export class AppRoutingModule {}
