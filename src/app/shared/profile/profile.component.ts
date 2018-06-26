import { animate, state, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'

import { Subscription } from 'rxjs'
import { Profile } from '../../core/settings/Profile'
import { SettingsService } from '../../core/settings/settings.service'
import { UiService } from '../../core/ui/ui.service'
import { ConfigDialogComponent } from '../config-dialog/config-dialog.component'

@Component({
  selector: 'mute-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('cardState', [
      state('void', style({ opacity: '0', visibility: 'hidden' })),
      state('visible', style({ opacity: '1', visibility: 'visible' })),
      transition('void => visible', animate('150ms ease-out')),
      transition('visible => void', animate('150ms ease-in')),
    ]),
  ],
})
export class ProfileComponent implements OnDestroy {
  private subs: Subscription[]

  public profile: Profile
  public cardState: string

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public settings: SettingsService,
    ui: UiService,
    cd: ChangeDetectorRef
  ) {
    this.profile = settings.profile
    this.cardState = 'void'
    this.subs = []
    this.subs[this.subs.length] = ui.click.subscribe(() => {
      this.cardState = 'void'
      cd.detectChanges()
    })
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  mousedown(event: Event) {
    event.stopPropagation()
  }

  openSettingsDialog() {
    const dialog = this.dialog.open(ConfigDialogComponent)
    dialog.afterClosed().subscribe(() => (this.cardState = 'void'))
  }

  signout() {
    this.settings.signout().then(() => {
      this.profile = this.settings.profile
      const snackBarRef = this.snackBar.open('Signed out', 'close', {
        duration: 3000,
      })
      snackBarRef.afterDismissed().subscribe(() => (this.cardState = 'void'))
    })
  }

  signinWith(provider: string) {
    this.settings
      .signin(provider)
      .then(() => {
        this.profile = this.settings.profile
        provider = provider[0].toUpperCase() + provider.substr(1)
        const snackBarRef = this.snackBar.open(`Signed in with ${provider}`, 'close', {
          duration: 3000,
        })
        snackBarRef.afterDismissed().subscribe(() => (this.cardState = 'void'))
      })
      .catch((err) => {
        log.error('Failed to signin: ', err)
        provider = provider[0].toUpperCase() + provider.substr(1)
        this.snackBar.open(`Failed to sign in with ${provider}`, 'close', {
          duration: 5000,
        })
      })
  }

  toggleCard(event: Event) {
    event.stopPropagation()
    this.cardState = this.cardState === 'visible' ? 'void' : 'visible'
  }
}
