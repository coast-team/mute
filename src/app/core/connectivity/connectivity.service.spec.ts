import { ConnectivityService } from './connectivity.service'

describe('ConnectivityService test', () => {
  let connectivityService: ConnectivityService

  beforeEach(() => connectivityService = new ConnectivityService())

  it('Correct Init', () => expect(connectivityService.getPreviousState()).toBe(undefined))

  it('Correct Changing State', () => {
    connectivityService.testConnection(undefined)
    expect(connectivityService.getPreviousState()).toBe(navigator.onLine)
  })
})
