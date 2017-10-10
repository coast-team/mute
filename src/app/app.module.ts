import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core'
import { MatSnackBar, MATERIAL_COMPATIBILITY_MODE } from '@angular/material'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DevLabelComponent } from './dev-label/dev-label.component'
import { CoreModule } from './core/core.module'
import { SharedModule } from './shared'
import { NavModule } from './nav'
import { DocModule } from './doc'
import { DocsModule } from './docs'
import { ToolbarComponent } from './toolbar/toolbar.component'
import { ServiceWorkerRegister } from './core/ServiceWorkerRegister'
import { WindowRefService } from './core/WindowRefService'
import { environment } from '../environments/environment'

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
    private snackBar: MatSnackBar,
    private windowRef: WindowRefService
  ) {
    if (environment.serviceWorker) {
      const serviceWorker = new ServiceWorkerRegister(windowRef.window)
      serviceWorker.registerSW()
      serviceWorker.observableState.subscribe((message) => {
        this.snackBar.open(message, 'Close', {
          duration: 5000
        })
      })
    }
  }
}
