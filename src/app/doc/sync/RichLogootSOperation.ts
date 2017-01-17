import { LogootSAdd, LogootSDel } from 'mute-structs'

export class RichLogootSOperation {

  readonly id: number
  readonly clock: number
  readonly logootSOp: LogootSAdd | LogootSDel

  constructor (id: number, clock: number, logootSOp: LogootSAdd | LogootSDel) {
    this.id = id
    this.clock = clock
    this.logootSOp = logootSOp
  }
}
