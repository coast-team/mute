import { Pipe, PipeTransform } from '@angular/core'

import { Doc } from '../../core/Doc'
import { DateEnhancedPipe } from './dateEnhanced.pipe'

@Pipe({
  name: 'muteRemote',
})
export class RemotePipe extends DateEnhancedPipe implements PipeTransform {
  transform(doc: Doc): string {
    if (doc) {
      if (doc.remotes.length === 0) {
        return 'No'
      } else if (doc.remotes[0].synchronized) {
        return super.transform(doc.remotes[0].synchronized)
      } else {
        return 'Not Yet'
      }
    }
    return ''
  }
}
