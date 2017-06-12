import { Subject } from 'rxjs'

export class ServiceWorkerRegister {

  public observableState = new Subject<string>()

  emitEvent (message: string) {
    this.observableState.next(message)
  }

  public registerSW (): void {

    if ('serviceWorker' in navigator) {
      // Delay registration until after the page has loaded, to ensure that our
      // precaching requests don't degrade the first visit experience.
      // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
      window.addEventListener('load', () => {
        // Your service-worker.js *must* be located at the top-level directory relative to your site.
        // It won't be able to control pages unless it's located at the same level or higher than them.
        // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
        // See https://github.com/slightlyoff/ServiceWorker/issues/468
        navigator.serviceWorker.register('service-worker.js').then((reg) => {
          // updatefound is fired if service-worker.js changes.
          reg.onupdatefound = () => {
            // The updatefound event implies that reg.installing is set; see
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            let installingWorker = reg.installing


            installingWorker.onstatechange = () => {
              switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                    // At this point, the old content will have been purged and the fresh content will
                    // have been added to the cache.
                    // It's the perfect time to display a "New content is available; please refresh."
                    // message in the page's interface.
                  this.emitEvent('New content is available')
                  log.info('Service Worker', 'New or updated content is available.')
                } else {
                    // At this point, everything has been precached.
                    // It's the perfect time to display a "Content is cached for offline use." message.
                  this.emitEvent('Content available offline')
                  log.info('Service Worker', 'Content is now available offline!')
                }
                break
              case 'redundant':
                console.error('The installing service worker became redundant.')
                break
              }
            }
          }
        })
          .catch((e) => {
            log.error('Error during service worker registration:', e)
          })
      })
    }
  }


}
