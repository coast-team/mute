import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { CryptoService } from '@app/core/crypto'
import { NetworkService } from './network.service'
import { PulsarService } from './pulsar.service'

describe('NetworkService', () => {
  const fake =  {}
  let networkService: NetworkService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: CryptoService, useValue: fake },
        PulsarService,
        NetworkService
      ]
    })
    networkService = TestBed.inject(NetworkService)
  })

  it('Correct Init', () => {
    expect(networkService).toBeTruthy('networkService has not been initialized')
    networkService.wg.join('key')
  })
})
