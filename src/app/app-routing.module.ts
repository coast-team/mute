import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AppResolverService } from './app-resolver.service'
import { DocHistoryComponent } from './doc/doc-history/doc-history.component'
import { DocResolverService } from './doc/doc-resolver.service'
import { DocComponent } from './doc/doc.component'
import { DocsResolverService } from './docs/docs-resolver.service'
import { DocsComponent } from './docs/docs.component'

const routes: Routes = [
  {
    path: '',
    resolve: { profile: AppResolverService },
    children: [
      {
        path: '',
        component: DocsComponent,
        resolve: { file: DocsResolverService }
      }, {
        path: 'home',
        redirectTo: '',
        children: [
          {
            path: ':path',
            component: DocsComponent,
            resolve: { file: DocsResolverService }
          }
        ]
      }, {
        path: 'trash',
        component: DocsComponent,
        resolve: { file: DocsResolverService },
        children: [
          {
            path: '**',
            component: DocsComponent
          }
        ]
      }, {
        path: 'history/:key',
        component: DocHistoryComponent,
        resolve: { file: DocResolverService }
      }, {
        path: 'history', redirectTo: ''
      }, {
        path: ':key',
        component: DocComponent,
        resolve: { file: DocResolverService }
      }
    ]
  }

]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: [ DocsResolverService, DocResolverService ]
})
export class AppRoutingModule {}
