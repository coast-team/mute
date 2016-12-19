import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

export const routes: Routes = [
  { path: 'doc', redirectTo: 'doc', pathMatch: 'prefix'},
  { path: '**', redirectTo: '' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
