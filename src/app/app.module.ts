import { APP_INITIALIZER, NgModule } from '@angular/core'
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
import { SharedModule } from './shared/shared.module'

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
  constructor(private sw: SwUpdate, ui: UiService) {
    sw.available.subscribe((event) => {
      const version = (event.available.appData as any).version
      const commit = (event.available.appData as any).commit
      ui.appUpdate.next({ version, commit })
    })
  }
}
