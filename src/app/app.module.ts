import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core'

/* App Root */
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DevLabelComponent } from './dev-label/dev-label.component'

/* Modules */
import { CoreModule } from './core/core.module'
import { SharedModule } from './shared'
import { NavModule } from './nav'
import { DocModule } from './doc'
import { DocsModule } from './docs'
import { ToolbarComponent } from './toolbar/toolbar.component'

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule,
    SharedModule,
    NavModule,
    DocsModule,
    DocModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    DevLabelComponent,
    ToolbarComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
