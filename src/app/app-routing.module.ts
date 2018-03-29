import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { DocResolverService } from './doc/doc-resolver.service'
import { DocComponent } from './doc/doc.component'
import { DocsComponent } from './docs/docs.component'
import { HistoryResolverService } from './history/history-resolver.service'
import { HistoryComponent } from './history/history.component'

const routes: Routes = [
  {
    path: '',
    component: DocsComponent,
  },
  {
    path: 'history/:key',
    component: HistoryComponent,
    resolve: { doc: HistoryResolverService },
  },
  {
    path: ':key',
    component: DocComponent,
    resolve: { doc: DocResolverService },
    canDeactivate: [DocResolverService],
  },
  {
    path: '**',
    redirectTo: '',
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
