import { Component, OnInit } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/toPromise'

import { UiService } from '../core/ui/ui.service'

@Component({
  selector: 'mute-dev-label',
  template: `
    Preview version (Nightly build: <a [href]='url' target="_blank">{{shortID}}</a>)
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
  `]
})
export class DevLabelComponent implements OnInit {

  url = 'https://github.com/coast-team/mute/tree/'
  shortID: string
  digest: number

  constructor (private http: Http, private ui: UiService) {
    http.get('https://api.github.com/repos/coast-team/mute/branches/gh-pages')
      .toPromise()
      .then((response) => {
        this.url += response.json().commit.commit.message
        this.shortID = response.json().commit.commit.message.substr(0, 7)
      })
      .catch((err) => console.log('DevLabelComponent could not fetch commit number: ', err))
  }

  ngOnInit (): void {
    this.ui.onDocDigest.subscribe((digest: number) => {
      this.digest = digest
    })
  }

}
