import { inject, TestBed } from '@angular/core/testing'

import { CryptoService } from './crypto.service'

describe('SymmetricCryptoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CryptoService],
    })
  })

  it('should be created', inject([CryptoService], (service: CryptoService) => {
    expect(service).toBeTruthy()
  }))
})
