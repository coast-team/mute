import { RichLogootSOperation } from './RichLogootSOperation'

export class State {

  readonly vector: Map<number, number>
  readonly richLogootSOps: RichLogootSOperation[]

  constructor (vector: Map<number, number>, richLogootSOps: RichLogootSOperation[]) {
    this.vector = vector
    this.richLogootSOps = richLogootSOps
  }
}
