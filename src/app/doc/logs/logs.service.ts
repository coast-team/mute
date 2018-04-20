import { Injectable } from '@angular/core'

@Injectable()
export class LogsService {

  constructor () {
    console.log('[LOGS] Log system start')
  }

  log (obj: object) {
    console.log('[LOGS]', obj)
  }
}
