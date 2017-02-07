const NUMBER_OF_UDP_TURN_TO_USE = 1
const NUMBER_OF_TCP_TURN_TO_USE = 1
const NUMBER_OF_STAN_TO_USE = 1

export function fetchIceServers (): Promise<Array<RTCIceServer>> {
  return fetch(atob('aHR0cHM6Ly9zZXJ2aWNlLnhpcnN5cy5jb20vaWNlP2lkZW50PWthbGl0aW5' +
    'lJnNlY3JldD04MmI4ZmMzMi0yODA4LTExZTYtODNhNS04MTk1YzU4OTBiN2QmZG9tYWluPWxvcmlhLmZyJ' +
    'mFwcGxpY2F0aW9uPWRlZmF1bHQmcm9vbT1kZWZhdWx0JnNlY3VyZT0x'), {
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseObj) => {
      if (!('d' in responseObj) || !('iceServers' in responseObj.d)) {
        throw new Error('Unknown object syntax while fetching ice servers from XirSys')
      }
      const iceServers: Array<RTCIceServer> = []
      let tcpTurns = 0
      let udpTurns = 0
      let stans = 0
      for (let opt of responseObj.d.iceServers) {

        // 'url' is deprecated in favor of 'urls' parameter,
        // but 'url' is still used by Xirsys
        if ('url' in opt) {
          opt.urls = opt.url
          delete opt.url
        }

        // Better to provide at least 1 TCP TURN server and 1 UDP TURN server
        if (opt.urls.startsWith('turn')) {
          if (opt.urls.includes('tcp') && ++tcpTurns <= NUMBER_OF_TCP_TURN_TO_USE) {
            iceServers.push(opt)
          } else if (opt.urls.includes('udp') && ++udpTurns <= NUMBER_OF_UDP_TURN_TO_USE) {
            iceServers.push(opt)
          }
        } else if (opt.urls.startsWith('stun') && ++stans <= NUMBER_OF_STAN_TO_USE) {
          iceServers.push(opt)
        }
      }
      return iceServers
    })
}
