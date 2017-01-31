export function fetchIceServers () {
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
      const xirSysIceServers = responseObj.d.iceServers
      let resultIceServers: Array<Object> = []
      let turnNb = 0
      for (let opt of xirSysIceServers) {
        if ('url' in opt) {
          opt.urls = opt.url
          delete opt.url
        }
        if (opt.urls.startsWith('turn')) {
          turnNb++
          if (turnNb <= 2) {
            resultIceServers.push(opt)
          }
        } else {
          resultIceServers.push(opt)
        }
      }
      return resultIceServers
    })
}
