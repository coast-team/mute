import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

export class PkRequests {
  constructor(private http: HttpClient) {}

  async register(pk: string, login: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(environment.coniksClient.url, `register ${login} ${pk}`, { responseType: 'text' })
        .subscribe(() => resolve(), (err) => reject(err))
    })
  }

  async lookup(login: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http
        .post(environment.coniksClient.url, `lookup ${login}`, { responseType: 'text' })
        .subscribe((pk) => resolve(pk.match(/\{.*\}/)[0]), (err) => reject(err))
    }) as Promise<string>
  }
}
