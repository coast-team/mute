import { Component, Input, OnInit } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Profile } from 'src/app/core/settings/Profile'

@Component({
  selector: 'mute-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit{
  @Input() profile: Profile | { deviceID: string, avatar: string }
  @Input() size = 32

  svg: SafeHtml = ''

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    const svgCode = (window as any).multiavatar(this.profile.deviceID)
    this.svg = this.sanitizer.bypassSecurityTrustHtml(svgCode)
  }

  get avatarIsNotDefault () {
    return this.profile.avatar && this.profile.avatar !== 'assets/images/icons/account-circle.svg'
  }
}
