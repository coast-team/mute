export class Author {
  private authorName: string
  private authorId: number
  private authorColor: string

  constructor(authorName: string, authorId: number, authorColor: string) {
    this.authorName = authorName
    this.authorId = authorId
    this.authorColor = authorColor
  }

  getColor(): string {
    return this.authorColor
  }

  getId(): number {
    return this.authorId
  }

  getName(): string {
    return this.authorName
  }
}
