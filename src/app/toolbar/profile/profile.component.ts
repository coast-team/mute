import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations'
import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core'
import { MatButton, MatSnackBar } from '@angular/material'

import { Profile } from '../../core/profile/Profile'
import { ProfileService } from '../../core/profile/profile.service'

@Component({
  selector: 'mute-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('cardState', [
      state('visible', style({
        opacity: '1'
      })),
      transition('void => visible', animate('150ms ease-out')),
      transition('visible => void', animate('150ms ease-in'))
    ])
  ]
})
export class ProfileComponent {

  @ViewChild('profileIcon') profileIcon: MatButton

  @Input() profile: Profile
  public cardState: string
  private mouseOver: boolean

  constructor (
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    public profileService: ProfileService
  ) {}

  signout () {
    this.profileService.signout()
      .then(() => {
        const snackBarRef = this.snackBar.open('Signed out', 'close', {
          duration: 3000
        })
        this.profileIcon.focus()
        snackBarRef.afterDismissed().subscribe(() => {
          this.cardState = 'void'
        })
      })
  }

  signinWith (provider: string) {
    this.profileService.signin(provider)
      .then(() => {
        provider = provider[0].toUpperCase() + provider.substr(1)
        const snackBarRef = this.snackBar.open(`Signed in with ${provider}`, 'close', {
          duration: 5000
        })
        this.profileIcon.focus()
        snackBarRef.afterDismissed().subscribe(() => {
          this.cardState = 'void'
        })
      })
      .catch(() => {
        provider = provider[0].toUpperCase() + provider.substr(1)
        this.snackBar.open(`FAILED to sign in with ${provider}`, 'close', {
          duration: 5000
        })
      })
  }

  toggleCard () {
    this.cardState = this.cardState === 'visible' ? 'void' : 'visible'
    this.changeDetectorRef.detectChanges()
  }

  setMouseOver (value) {
    this.mouseOver = value
  }

  hideCard () {
    if (!this.mouseOver) {
      this.cardState = 'void'
      this.changeDetectorRef.detectChanges()
    }
  }

}
