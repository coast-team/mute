import { Doc } from '../../Doc'
import { LocalStorageService } from './local-storage.service'

describe('LocalStorageService', () => {
  let localStorage: LocalStorageService
  let doc: Doc

  beforeEach(() => {
    localStorage = new LocalStorageService()
    doc = localStorage.createDoc()
  })

  it('Correct Init', () => {
    expect(localStorage).toBeTruthy()
  })

  it('Get doc', () => {
    localStorage.get(doc.id).then((fetchDoc) => {
      expect(fetchDoc === doc).toBeTruthy()
    })
  })

  it('Delete doc', () => {
    doc.delete().then(() => {
      localStorage.get(doc.id).catch((del) => {
        expect(del === new Error('Cannot find document ' + doc.id)).toBeTruthy()
      })
    })
  })
})
