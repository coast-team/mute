export abstract class File {
  public title: string

  constructor (title: string) {
    this.title = title
  }

  abstract get id (): string
}
