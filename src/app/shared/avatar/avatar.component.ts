import { Component, Input } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Profile } from 'src/app/core/settings/Profile'

@Component({
  selector: 'mute-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input('profile') profile: Profile
  @Input('size') size = 32

  svg: SafeHtml = ''

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    const svgCode = (window as any).multiavatar(this.profile.deviceID)
    this.svg = this.sanitizer.bypassSecurityTrustHtml(svgCode)
  }

  get avatarIsNotDefault () {
    return this.profile.avatar && this.profile.avatar !== 'assets/images/icons/account-circle.svg'
  }
}
