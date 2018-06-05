import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnDestroy, ViewChild } from '@angular/core'
import { MatButton, MatDialog, MatSnackBar } from '@angular/material'

import { Profile } from '../../core/settings/Profile'
import { SettingsService } from '../../core/settings/settings.service'
import { ConfigDialogComponent } from '../config-dialog/config-dialog.component'

@Component({
  selector: 'mute-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('cardState', [
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
export class ProfileComponent implements OnDestroy {
  @ViewChild('profileIcon') profileIcon: MatButton

  public cardState: string
  public profile: Profile

  constructor(private snackBar: MatSnackBar, public settings: SettingsService, private dialog: MatDialog) {
    this.profile = settings.profile
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.hideCard)
  }

  clickOnCard(event: Event) {
    event.stopPropagation()
  }

  openSettingsDialog() {
    const dialog = this.dialog.open(ConfigDialogComponent)
    dialog.afterClosed().subscribe(() => {
      this.cardState = 'void'
    })
  }

  signout() {
    this.settings.signout().then(() => {
      this.profile = this.settings.profile
      const snackBarRef = this.snackBar.open('Signed out', 'close', {
        duration: 3000,
      })
      this.profileIcon.focus()
      snackBarRef.afterDismissed().subscribe(() => this.hideCard())
    })
  }

  signinWith(provider: string) {
    this.settings
      .signin(provider)
      .then(() => {
        this.profile = this.settings.profile
        provider = provider[0].toUpperCase() + provider.substr(1)
        const snackBarRef = this.snackBar.open(`Signed in with ${provider}`, 'close', {
          duration: 5000,
        })
        this.profileIcon.focus()
        snackBarRef.afterDismissed().subscribe(() => this.hideCard())
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
    if (this.cardState === 'visible') {
      this.hideCard()
    } else {
      this.showCard()
    }
  }

  showCard() {
    window.addEventListener('click', this.hideCard.bind(this))
    this.cardState = 'visible'
  }

  hideCard() {
    window.removeEventListener('click', this.hideCard)
    this.cardState = 'void'
  }
}
