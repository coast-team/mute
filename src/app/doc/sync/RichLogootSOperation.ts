import { LogootSAdd, LogootSDel } from 'mute-structs'

export class RichLogootSOperation {

  readonly id: number
  readonly clock: number
  readonly logootSOp: LogootSAdd | LogootSDel

  static fromPlain (o: {id: number, clock: number, logootSOp: any}): RichLogootSOperation | null {

    const logootSAdd: LogootSAdd | null = LogootSAdd.fromPlain(o.logootSOp)
    if (logootSAdd instanceof LogootSAdd) {
      return new RichLogootSOperation(o.id, o.clock, logootSAdd)
    }

    const logootSDel: LogootSDel | null = LogootSDel.fromPlain(o.logootSOp)
    if (logootSDel instanceof LogootSDel) {
      return new RichLogootSOperation(o.id, o.clock, logootSDel)
    }

    return null
  }

  constructor (id: number, clock: number, logootSOp: LogootSAdd | LogootSDel) {
    this.id = id
    this.clock = clock
    this.logootSOp = logootSOp
  }
}
