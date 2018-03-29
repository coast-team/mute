import { DatePipe } from '@angular/common'
import { Pipe, PipeTransform } from '@angular/core'

import { Doc } from '../../core/Doc'

const today = new Date()
const todayYear = today.getFullYear()
const todayDate = today.getDate()
const basic = 'MMMM d, y, h:mm a'

@Pipe({
  name: 'muteDate',
})
export class DateEnhancedPipe extends DatePipe implements PipeTransform {
  transform(date: any): string {
    if (date && date instanceof Date) {
      let prefix = ''
      let format = 'MMMM d, y, h:mm a'

      if (todayYear === date.getFullYear()) {
        format = 'MMMM d, h:mm a'
        if (todayDate === date.getDate()) {
          format = 'h:mm a'
        } else if (todayDate === date.getDate() - 1) {
          prefix = 'yesterday '
        }
      }
      return prefix + super.transform(date, format)
    }
    return ''
  }
}
