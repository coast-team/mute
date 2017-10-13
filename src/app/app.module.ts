import { NgModule } from '@angular/core'
import { MATERIAL_COMPATIBILITY_MODE, MatSnackBar } from '@angular/material'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { CoreModule } from './core/core.module'
import { ServiceWorkerRegister } from './core/ServiceWorkerRegister'
import { DevLabelComponent } from './dev-label/dev-label.component'
import { DocModule } from './doc'
import { DocsModule } from './docs'
import { NavModule } from './nav'
import { SharedModule } from './shared'
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
  providers: [
    {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor (
    private snackBar: MatSnackBar
  ) {
    if (environment.serviceWorker) {
      const serviceWorker = new ServiceWorkerRegister(global.window)
      serviceWorker.registerSW()
      serviceWorker.observableState.subscribe((message) => {
        this.snackBar.open(message, 'Close', {
          duration: 5000
        })
      })
    }
  }
}
