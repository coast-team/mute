import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

export class PKRequestConiks {
  private url: string
  constructor(private http: HttpClient) {
    this.url = environment.cryptography.coniksClient ? environment.cryptography.coniksClient.url : ''
  }

  async register(pk: string, login: string) {
    return new Promise((resolve, reject) => {
      if (this.url) {
        this.http.post(this.url, `register ${login} ${pk}`, { responseType: 'text' }).subscribe(
          () => {
            log.info('CONIKS', 'Public Key REGISTERED Successfully for ' + login)
            resolve()
          },
          (err) => {
            log.error('Public Key REGISTERATION ERROR for ' + login, err)
            reject(err)
          }
        )
      } else {
        Promise.reject(new Error('coniksClient property is not defined'))
      }
    })
  }

  async lookup(login: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.url) {
        this.http.post(this.url, `lookup ${login}`, { responseType: 'text' }).subscribe(
          (pk) => {
            log.info('CONIKS', 'Public Key FOUND in Coniks server for ' + login)
            resolve(pk.match(/\{.*\}/)[0])
          },
          (err) => {
            log.info('CONIKS', 'Public Key NOT FOUND in Coniks server for ' + login)
            reject(err)
          }
        )
      } else {
        Promise.reject(new Error('coniksClient property is not defined'))
      }
    }) as Promise<string>
  }
}
