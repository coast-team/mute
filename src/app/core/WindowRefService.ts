import { Injectable } from '@angular/core'

function _window (): Window {
  return window
}

@Injectable()
export class WindowRefService {

  get window (): Window { return _window() }
}
