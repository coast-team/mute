import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { MaterialModule } from '@angular/material'

/* App Root */
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { LeftsideComponent } from 'leftside'
import { DevLabelComponent } from 'dev-label'

/* Modules */
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
    MaterialModule.forRoot(),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
