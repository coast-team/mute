import { APP_INITIALIZER, NgModule } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker'

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

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.serviceWorker }),
    BrowserAnimationsModule,
    CoreModule,
    AppRoutingModule,
    DocsModule,
    DocModule,
    HistoryModule,
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
  constructor(private snackBar: MatSnackBar, private sw: SwUpdate, private ui: UiService) {
    // sw.available.subscribe((event) => {
    //   console.log('Event: ', event)
    //   console.log('current version is', event.current)
    //   console.log('available version is', event.available)
    // })
    // sw.activated.subscribe((event) => {
    //   console.log('Event: ', event)
    //   console.log('old version was', event.previous)
    //   console.log('new version is', event.current)
    // })
    sw.available.subscribe((event) => {
      const version = (event.available.appData as any).version
      const snackBarRef = this.snackBar.open(`New ${version} is available`, 'Update', {
        duration: 5000,
      })
      snackBarRef.onAction().subscribe(() => {
        sw.activateUpdate()
          .then(() => document.location.reload())
          .catch((err) => log.debug('Error activating SW update: ', err))
      })
    })
  }
}
