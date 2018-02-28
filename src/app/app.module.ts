import { APP_INITIALIZER, NgModule } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker'
import { AuthService } from 'ng2-ui-auth'

import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { CoreModule } from './core/core.module'
import { ProfileService } from './core/profile/profile.service'
import { BotStorageService } from './core/storage/bot-storage/bot-storage.service'
import { StorageService } from './core/storage/storage.service'
import { DevLabelComponent } from './dev-label/dev-label.component'
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
    HistoryModule
  ],
  declarations: [
    AppComponent,
    DevLabelComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (profile: ProfileService, storage: StorageService) => {
        return () => profile.init().then(() => storage.init(profile))
      },
      deps: [ProfileService, StorageService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (botStorage: BotStorageService) => () => botStorage.init(),
      deps: [BotStorageService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor (
    private snackBar: MatSnackBar,
    private sw: SwUpdate
  ) {
    sw.available.subscribe((event) => {
      const snackBarRef = this.snackBar.open('New version of MUTE is available.', 'Update', {
        duration: 5000
      })
      snackBarRef.onAction().subscribe(() => {
        sw.activateUpdate()
          .then(() => document.location.reload())
          .catch((err) => log.debug('Error activating SW update: ', err))
      })
    })
  }
}
