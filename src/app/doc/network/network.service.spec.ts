import { TestBed } from '@angular/core/testing'
import { NetworkService } from './network.service'

xdescribe('NetworkService', () => {
  const networkService: NetworkService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: NetworkService, useValue: networkService }
      ]
    })

    networkService.wg.join('key') // FIXME: wg undefined
  })

  it('Correct Init', () => {
    expect(networkService).toBeTruthy()
  })
})
