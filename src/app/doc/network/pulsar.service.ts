import { Injectable, OnDestroy } from '@angular/core'

@Injectable()
export class PulsarService implements OnDestroy {
  constructor() {}
  ngOnDestroy() {
    // couper lien avec Pulsar ici
  }
  sendMessageToPulsar(streamId: number, content: Uint8Array, keyTopic: string) {
    console.log('StreamId : ' + streamId)
  }
}
