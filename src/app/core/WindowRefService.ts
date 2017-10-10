import { Injectable } from '@angular/core'

function _window (): Window {
  /* tslint:disable: no-invalid-this */
  return typeof this === 'object' ? this : Function('return this')()
}

@Injectable()
export class WindowRefService {

  get window (): Window {
    return _window()
  }
}
