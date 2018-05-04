import { inject, TestBed } from '@angular/core/testing'

import { SymmetricCryptoService } from './symmetric-crypto.service'

describe('SymmetricCryptoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SymmetricCryptoService]
    })
  })

  it(
    'should be created',
    inject([SymmetricCryptoService], (service: SymmetricCryptoService) => {
      expect(service).toBeTruthy()
    })
  )
})
