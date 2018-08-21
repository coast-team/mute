import { DatePipe } from '@angular/common'
import { Pipe, PipeTransform } from '@angular/core'

const oneDay = 864e5 // 864e5 == 86400000 == 24*60*60*100

@Pipe({
  name: 'muteDate',
})
export class DateEnhancedPipe extends DatePipe implements PipeTransform {
  transform(date: any): string {
    const today = new Date()
    const todayYear = today.getFullYear()
    today.setUTCHours(0, 0, 0, 0)
    if (date && date instanceof Date) {
      let prefix = ''
      let format: string
      const diff = today.getTime() - date.getTime()
      if (diff > 0) {
        if (diff < oneDay) {
          format = 'HH:mm'
          prefix = 'yesterday '
        } else {
          format = todayYear === date.getFullYear() ? 'MMM d, y' : 'MMM d'
        }
      } else {
        format = 'HH:mm'
      }

      return prefix + super.transform(date, format)
    }
    return ''
  }
}
