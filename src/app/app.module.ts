import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core'
import { MdSnackBar } from '@angular/material'

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
export class AppModule {
  constructor (
    private snackBar: MdSnackBar,
    private windowRef: WindowRefService
  ) {
    const serviceWorker = new ServiceWorkerRegister(windowRef.window)
    serviceWorker.registerSW()
    serviceWorker.observableState.subscribe((message) => {
      this.snackBar.open(message, 'Close', {
        duration: 5000
      })
    })
  }
}
