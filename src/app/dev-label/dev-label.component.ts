import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/toPromise'

import { UiService } from '../core/ui/ui.service'

import * as mnemonic from 'mnemonicjs'

@Component({
  selector: 'mute-dev-label',
  template: `
    Preview version: <a [href]='url' target="_blank">{{shortID}}</a>
    <br>
    Digest: {{digest}}
    `,
  styles: [`
    :host {
      position: fixed;
      font-size: 1.1rem;
      bottom: 20px;
      right: 20px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevLabelComponent implements OnInit {

  url = 'https://github.com/coast-team/mute/tree/'
  shortID: string
  digest: string

  constructor (
    private http: Http,
    private ui: UiService,
    private detectRef: ChangeDetectorRef
  ) {
    http.get('https://api.github.com/repos/coast-team/mute/branches/gh-pages')
      .toPromise()
      .then((response) => {
        this.url += response.json().commit.commit.message
        this.shortID = response.json().commit.commit.message.substr(0, 7)
      })
      .catch((err) => log.warn('DevLabelComponent could not fetch commit number: ', err))
  }

  ngOnInit (): void {
    this.ui.onDocDigest.subscribe((digest: number) => {
      this.digest = mnemonic.encode_int32(digest)
      this.detectRef.markForCheck()
    })
  }

}
