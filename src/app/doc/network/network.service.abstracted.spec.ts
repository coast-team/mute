import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { CryptoService } from '@app/core/crypto'

import { NetworkServiceAbstracted } from './network.service.abstracted'
import { PulsarService } from './pulsar.service'

describe('NetworkServiceAbstracted', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: CryptoService, useValue: {} }, PulsarService, NetworkServiceAbstracted],
    })
  })

  it('Should initialize the service', () => {
    const initNetworkSolution = spyOn(NetworkServiceAbstracted.prototype, 'initNetworkSolution' as never).and.stub()
    const setAndInitCryptoServiceNetworkSolution = spyOn(
      NetworkServiceAbstracted.prototype,
      'setAndInitCryptoServiceNetworkSolution' as never
    ).and.stub()
    const networkServiceAbstracted = TestBed.inject(NetworkServiceAbstracted)
    expect(networkServiceAbstracted).toBeTruthy('networkServiceAbstracted has not been initialized')
    expect(initNetworkSolution).toHaveBeenCalledTimes(1)
    expect(setAndInitCryptoServiceNetworkSolution).toHaveBeenCalledTimes(1)
  })
})
