import { DatePipe } from '@angular/common'
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core'

const oneDay = 864e5 // 864e5 == 86400000 == 24*60*60*100

@Pipe({
  name: 'muteDate',
})
export class DateEnhancedPipe extends DatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) locale: string) {
    super(locale)
  }

  transform(value: string | number | Date, timezone: string = null): any {
    const today = new Date()
    const todayYear = today.getFullYear()
    today.setUTCHours(0, 0, 0, 0)
    if (value && value instanceof Date) {
      let prefix = ''
      let format: string
      const diff = today.getTime() - value.getTime()
      if (diff > 0) {
        if (diff < oneDay) {
          format = 'HH:mm'
          prefix = 'yesterday '
        } else {
          format = todayYear === value.getFullYear() ? 'MMM d, y' : 'MMM d'
        }
      } else {
        format = 'HH:mm'
      }

      return prefix + super.transform(value, format, timezone)
    }
    return ''
  }
}
