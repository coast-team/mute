import { Author } from './Author'

describe('Author', () => {
  let author: Author

  beforeEach(() => {
    author = new Author('name', 10, 'blue')
  })

  it('Correct Init', () => {
    expect(author).toBeTruthy()
  })

  it('Get name', () => {
    expect(author.getName() === 'name').toBeTruthy()
  })

  it('Get color', () => {
    expect(author.getColor() === 'blue').toBeTruthy()
  })

  it('Get name', () => {
    expect(author.getId() === 10).toBeTruthy()
  })
})
