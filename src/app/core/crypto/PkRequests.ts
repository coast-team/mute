import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

export class PkRequests {
  private url: string
  constructor(private http: HttpClient) {
    this.url = environment.cryptography.coniksClient ? environment.cryptography.coniksClient.url : ''
  }

  async register(pk: string, login: string) {
    return new Promise((resolve, reject) => {
      if (this.url) {
        this.http.post(this.url, `register ${login} ${pk}`, { responseType: 'text' }).subscribe(() => resolve(), (err) => reject(err))
      } else {
        Promise.reject(new Error('coniksClient property is not defined'))
      }
    })
  }

  async lookup(login: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.url) {
        this.http
          .post(this.url, `lookup ${login}`, { responseType: 'text' })
          .subscribe((pk) => resolve(pk.match(/\{.*\}/)[0]), (err) => reject(err))
      } else {
        Promise.reject(new Error('coniksClient property is not defined'))
      }
    }) as Promise<string>
  }
}
