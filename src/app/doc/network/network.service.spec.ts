import { NetworkService } from './network.service'

describe('Network registration tests', () => {
  let networkService: NetworkService

  beforeEach(() => {
    networkService = new NetworkService()
    networkService.initWebChannel()
    networkService.join('key')
  })

  it('Correct iceServer', () => {
    networkService.fetchServer().then((iceServers) => {
      console.log(iceServers)
      expect(iceServers).toBeDefined()
    })
  })

  it('Correct key', () => {
    expect(networkService.key).toBe('key')
  })

})