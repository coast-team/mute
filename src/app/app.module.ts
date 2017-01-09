import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { MaterialModule } from '@angular/material'
import { FlexLayoutModule } from '@angular/flex-layout'

/* App Root */
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DevLabelComponent } from 'dev-label'

/* Modules */
import { CoreModule } from './core/core.module'
import { DocModule } from 'doc'
import { DocsModule } from 'docs'
import { NavModule } from 'nav'


@NgModule({
  declarations: [
    AppComponent,
    DevLabelComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    DocModule,
    DocsModule,
    MaterialModule.forRoot(),
    FlexLayoutModule.forRoot(),
    NavModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
