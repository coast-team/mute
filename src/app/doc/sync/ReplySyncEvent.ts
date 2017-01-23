import { Interval } from './Interval'
import { RichLogootSOperation } from './RichLogootSOperation'

export class ReplySyncEvent {

  readonly richLogootSOps: RichLogootSOperation[]
  readonly intervals: Interval[]

  constructor (richLogootSOps: RichLogootSOperation[], intervals: Interval[]) {
    this.richLogootSOps = richLogootSOps
    this.intervals = intervals
  }
}
