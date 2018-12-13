import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

interface IPK {
  pk: string
}

interface IUserPK {
  login: string
  deviceID: string
  pk: string
}

export class PKRequest {
  private urlPrefix: string
  constructor(private http: HttpClient) {
    this.urlPrefix = environment.cryptography.keyserver ? environment.cryptography.keyserver.urlPrefix : ''
  }

  async register(login: string, deviceID: string, pk: string) {
    return new Promise((resolve, reject) => {
      if (this.urlPrefix) {
        this.http.post<IUserPK>(this.urlPrefix, { login, deviceID, pk } as IUserPK).subscribe(
          (userPK) => {
            log.info('Signing KeyPair', `Public Key REGISTERED Successfully for ${userPK.login}:${userPK.deviceID}`, userPK.pk)
            resolve()
          },
          (err) => {
            log.error('Signing KeyPair', `Public Key REGISTERATION ERROR for ${login}:${deviceID}`, err)
            reject(err)
          }
        )
      } else {
        Promise.reject(new Error('Keyserver property is not defined'))
      }
    })
  }

  async lookup(login: string, deviceID: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.urlPrefix) {
        const url = `${this.urlPrefix}/${login}/${deviceID}`
        this.http.get<IPK>(url).subscribe(
          (pk) => {
            log.info('Signing KeyPair', `LOOKUP ${login}:${deviceID} FOUND`, pk.pk)
            resolve(pk.pk)
          },
          (err) => {
            if (err.error instanceof ErrorEvent) {
              // A client-side or network error occurred. Handle it accordingly.
              log.error('Signing KeyPair', 'An error occurred:', err.error.message)
              reject(err)
            } else {
              log.error('Signing KeyPair', `For ${login}:${deviceID}, HTTP code ${err.status}, ` + `body was: ${err.error}`)
              resolve('')
            }
          }
        )
      } else {
        Promise.reject(new Error('Keyserver property is not defined'))
      }
    }) as Promise<string>
  }

  async update(login: string, deviceID: string, pk: string) {
    return new Promise((resolve, reject) => {
      if (this.urlPrefix) {
        const url = `${this.urlPrefix}/${login}/${deviceID}`
        this.http.put<IPK>(url, { pk } as IPK).subscribe(
          () => {
            log.info('Signing KeyPair', `Public Key UPDATED in keyserver for ${login}:${deviceID}`, pk)
            resolve()
          },
          (err) => {
            log.info('Signing KeyPair', `Public Key NOT UPDATED in keyserver for ${login}:${deviceID}`)
            reject(err)
          }
        )
      } else {
        Promise.reject(new Error('Keyserver property is not defined'))
      }
    })
  }
}
