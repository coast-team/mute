import { Pipe, PipeTransform } from '@angular/core'

import { Doc } from '../core/Doc'

@Pipe({
  name: 'muteRemote'
})
export class RemotePipe implements PipeTransform {

  transform (doc: Doc, args?: any): any {
    if (doc.remotes.length === 0) {
      return 'No'
    } else if (doc.remotes[0].synchronized) {
      return doc.remotes[0].synchronized
    } else {
      return 'Not Yet'
    }
  }

}
