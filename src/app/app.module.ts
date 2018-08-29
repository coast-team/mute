import { APP_INITIALIZER, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker'

import { MatSnackBar } from '@angular/material'
import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { CoreModule } from './core/core.module'
import { SettingsService } from './core/settings/settings.service'
import { BotStorageService } from './core/storage/bot/bot-storage.service'
import { getIndexedDBState } from './core/storage/local/indexedDBCheck'
import { LocalStorageService } from './core/storage/local/local-storage.service'
import { UiService } from './core/ui/ui.service'
import { DocModule } from './doc'
import { DocsModule } from './docs/docs.module'
import { HistoryModule } from './history/history.module'
import { SharedModule } from './shared/shared.module'

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    CoreModule,
    AppRoutingModule,
    DocsModule,
    DocModule,
    HistoryModule,
    SharedModule,
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (settings: SettingsService, localStorage: LocalStorageService, botStorage: BotStorageService) => async () => {
        await getIndexedDBState()
        await settings.init()
        await localStorage.init(settings)
      },
      deps: [SettingsService, LocalStorageService, BotStorageService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(sw: SwUpdate, ui: UiService, snackBar: MatSnackBar) {
    // Service worker update
    sw.available.subscribe((event) => {
      const version = (event.available.appData as any).version
      ui.appUpdate.next({ version })
    })

    // App install event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      ui.appInstall.next(true)
      ui.appInstallEvent = e
    })

    window.addEventListener('appinstalled', (evt) => {
      snackBar.open('Application has successfully been installed', 'Close', { duration: 3000 })
    })
  }
}
