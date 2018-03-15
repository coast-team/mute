import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { DocResolverService } from './doc/doc-resolver.service'
import { DocComponent } from './doc/doc.component'
import { DocsResolverService } from './docs/docs-resolver.service'
import { DocsComponent } from './docs/docs.component'
import { HistoryResolverService } from './history/history-resolver.service'
import { HistoryComponent } from './history/history.component'

const routes: Routes = [
  {
    path: '',
    component: DocsComponent,
    resolve: { folder: DocsResolverService },
  }, {
    path: 'history/:key',
    component: HistoryComponent,
    resolve: { doc: HistoryResolverService },
  }, {
    path: ':key',
    component: DocComponent,
    resolve: { doc: DocResolverService },
  }, {
    path: '**', redirectTo: ''
  }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: []
})
export class AppRoutingModule {}
