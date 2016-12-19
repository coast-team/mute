import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { MaterialModule } from '@angular/material'

/* App Root */
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { LeftsideComponent } from 'leftside'
import { DevLabelComponent } from 'dev-label'

/* Module imports */
import { CoreModule } from './core/core.module'
import { DocModule } from 'doc'
import { DocsModule } from 'docs'


@NgModule({
  declarations: [
    AppComponent,
    LeftsideComponent,
    DevLabelComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    DocModule,
    DocsModule,
    HttpModule,
    MaterialModule.forRoot(),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
