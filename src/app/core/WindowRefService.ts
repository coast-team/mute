import { Injectable } from '@angular/core'

function _window (): Window {
  /* tslint:disable: no-invalid-this */
  return typeof this === 'object' ? this : Function('return this')()
}

@Injectable()
export class WindowRefService {

  get window (): Window {
    console.log('Window object through function ', _window())
    console.log('Window object ', window)
    return _window()
  }
}
