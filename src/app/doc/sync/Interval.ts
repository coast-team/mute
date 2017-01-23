export class Interval {

  readonly id: number
  readonly begin: number
  readonly end: number

  constructor (id: number, begin: number, end: number) {
    this.id = id
    this.begin = begin
    this.end = end
  }
}
