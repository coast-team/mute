import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

/* App Root */
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DevLabelComponent } from 'dev-label'

/* Modules */
import { CoreModule } from './core/core.module'
import { SharedModule } from 'shared'
import { NavModule } from 'nav'
import { DocModule } from 'doc'
import { DocsModule } from 'docs'

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    NavModule,
    DocModule,
    DocsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    DevLabelComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
