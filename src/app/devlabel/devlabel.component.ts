import { Component } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/toPromise'

@Component({
  selector: 'mute-devlabel',
  template: `Preview version (Nightly build: <a [href]='url' target="_blank">{{shortID}}</a>)`,
  styles: [`
    :host {
      position: fixed;
      font-size: 1.1rem;
      bottom: 20px;
      right: 20px;
    }
  `]
})
export class DevlabelComponent {

  private url: string = 'https://github.com/coast-team/mute/tree/'
  private shortID: string

  constructor(http: Http) {
    http.get('https://api.github.com/repos/coast-team/mute/branches/gh-pages')
      .toPromise()
      .then((response) => {
        this.url += response.json().commit.commit.message
        this.shortID = response.json().commit.commit.message.substr(0, 7)
      })
      .catch((err) => console.log('DevlabelComponent error: ', err))

  }

}
