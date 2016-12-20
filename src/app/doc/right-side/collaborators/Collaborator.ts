export class Collaborator {
  public id: number
  public pseudo: string
  public color: string
  public cursor: any

  constructor (id, color) {
    this.id = id
    this.color = color
  }
}
