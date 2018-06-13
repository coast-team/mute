import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'

import { Subject } from 'rxjs'
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
      state('void', style({ opacity: '0', display: 'none' })),
      state(
        'visible',
        style({
          opacity: '1',
        })
      ),
      transition('void => visible', animate('150ms ease-out')),
      transition('visible => void', animate('150ms ease-in')),
    ]),
  ],
})
export class ProfileComponent {
  public profile: Profile
  public cardState: Subject<string>
  public currentCardState: string

  constructor(private snackBar: MatSnackBar, public settings: SettingsService, private dialog: MatDialog, ui: UiService) {
    this.profile = settings.profile
    this.cardState = new Subject()
    ui.click.subscribe(() => {
      this.cardState.next('void')
      this.currentCardState = 'void'
    })
  }

  clickOnCard(event: Event) {
    event.stopPropagation()
  }

  openSettingsDialog() {
    const dialog = this.dialog.open(ConfigDialogComponent)
    dialog.afterClosed().subscribe(() => {
      this.currentCardState = 'void'
      this.cardState.next('void')
    })
  }

  signout() {
    this.settings.signout().then(() => {
      this.profile = this.settings.profile
      const snackBarRef = this.snackBar.open('Signed out', 'close', {
        duration: 3000,
      })
      snackBarRef.afterDismissed().subscribe(() => {
        this.currentCardState = 'void'
        this.cardState.next('void')
      })
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
        snackBarRef.afterDismissed().subscribe(() => {
          this.currentCardState = 'void'
          this.cardState.next('void')
        })
      })
      .catch((err) => {
        log.error('Failed to signin: ', err)
        provider = provider[0].toUpperCase() + provider.substr(1)
        this.snackBar.open(`FAILED to sign in with ${provider}`, 'close', {
          duration: 5000,
        })
      })
  }

  toggleCard(event: Event) {
    event.stopPropagation()
    if (this.currentCardState === 'visible') {
      this.currentCardState = 'void'
      this.cardState.next('void')
    } else {
      this.currentCardState = 'visible'
      this.cardState.next('visible')
    }
  }
}
