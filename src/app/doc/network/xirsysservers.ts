export function fetchIceServers () {
  return fetch(atob('aHR0cHM6Ly9zZXJ2aWNlLnhpcnN5cy5jb20vaWNlP2lkZW50PWthbGl0aW5' +
    'lJnNlY3JldD04MmI4ZmMzMi0yODA4LTExZTYtODNhNS04MTk1YzU4OTBiN2QmZG9tYWluPWxvcmlhLmZyJ' +
    'mFwcGxpY2F0aW9uPWRlZmF1bHQmcm9vbT1kZWZhdWx0JnNlY3VyZT0x'), {
      method: 'GET',
    })
    .then((response) => response.json())
    .then((iceServers) => {
      for (let opt of iceServers) {
        if ('url' in opt) {
          opt.urls = opt.url
          delete opt.url
        }
      }
      return iceServers
    })
}
