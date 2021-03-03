import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { CryptoService } from '@app/core/crypto'

import { NetworkService } from './network.service'
import { PulsarService } from './pulsar.service'

describe('NetworkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: CryptoService, useValue: {} },
        PulsarService,
        NetworkService
      ]
    })
  })

  it('Should initialize the service', () => {
    const configureEncryption = spyOn(NetworkService.prototype, 'configureEncryption' as never).and.stub()
    const networkService = TestBed.inject(NetworkService)

    expect(networkService).toBeTruthy('networkService has not been initialized')
    expect(configureEncryption).toHaveBeenCalledTimes(1)
    // networkService.wg.join('key') // FIXME: doc is undefined in subscription
  })
})
