export class IceServers {

  public onConfig: any

  constructor () {
    this.onConfig = () => {}
    const request = new XMLHttpRequest()
    request.open('GET', atob('aHR0cHM6Ly9zZXJ2aWNlLnhpcnN5cy5jb20vaWNlP2lkZW50PWthbGl0aW5lJnNlY3JldD04MmI4ZmMzMi0yODA4LTExZTYtODNhNS04MTk1YzU4OTBiN2QmZG9tYWluPWxvcmlhLmZyJmFwcGxpY2F0aW9uPWRlZmF1bHQmcm9vbT1kZWZhdWx0JnNlY3VyZT0x'), true)
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        const resp = request.responseText
        const iceServers = JSON.parse(resp).d.iceServers
        for (let opt of iceServers) {
          if ('url' in opt) {
            opt.urls = opt.url
            delete opt.url
          }
        }
        this.onConfig(iceServers)
      } else {
        log.warn('Error retreiving from XirSys')
      }
    }

    request.onerror = function () {
      log.warn('Error retreiving from XirSys')
    }
    request.send()
  }
}
