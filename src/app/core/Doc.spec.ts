import { Doc } from './Doc'
import { LocalStorageService } from './storage/local-storage/local-storage.service'

describe( 'Doc', () => {
  let doc: Doc

  beforeEach( () => {
    doc = new Doc('key', 'title', new LocalStorageService)
  })

  it( 'Correct Init', () => {
    expect(doc).toBeTruthy()
  })

  it('Correct Id', () => (
    expect(doc.id === 'key').toBeTruthy()
  ))

})
