import { HttpClientTestingModule } from '@angular/common/http/testing'
import { inject, TestBed } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { Ng2UiAuthModule } from 'np2-ui-auth'
import { SettingsService } from '../settings/settings.service'

import { CryptoService } from './crypto.service'

describe('SymmetricCryptoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule.forRoot([]), HttpClientTestingModule, Ng2UiAuthModule.forRoot() ],
      providers: [CryptoService, SettingsService]
    })
  })

  it('should be created', inject([CryptoService], (service: CryptoService) => {
    expect(service).toBeTruthy()
  }))
})
