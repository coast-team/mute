import { NetworkService } from './network.service'

describe('NetworkService', () => {
  let networkService: NetworkService

  beforeEach(() => {
    networkService = new NetworkService()
    networkService.initWebChannel()
    networkService.webChannel.join('key')
  })

  it('Correct Init', () => {
    expect(networkService).toBeTruthy()
  })

  it('IceServers', () => {
    networkService.fetchServer().then((iceServers) => {
      console.log(iceServers)
      expect(iceServers).toBeDefined()
    })
  })

  it('Key', () => {
    expect(networkService.key).toBe('key')
  })

})
