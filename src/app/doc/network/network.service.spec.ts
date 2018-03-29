import { NetworkService } from './network.service'

describe('NetworkService', () => {
  let networkService: NetworkService

  beforeEach(() => {
    networkService = new NetworkService()
    networkService.init()
    networkService.wg.join('key')
  })

  it('Correct Init', () => {
    expect(networkService).toBeTruthy()
  })
})
