import { environment } from '../../../environments/environment'
import { PulsarService } from '../network/pulsar.service'
import { ILogDatabase } from './ILogDatabase'

export class Pulsar implements ILogDatabase {
  private key: string
  private localName: string
  private pulsarService: PulsarService

  constructor(docKey: string) {
    this.key = docKey
    this.localName = 'msgPulsarLogs' + this.key

    // this.pulsarService.socketsLogs = this.key // création des ws pour Prod/Cons des logs et envoi de ceux stockés dans le local storage
  }
  subscribeToWs(pulsarService: PulsarService) {
    this.pulsarService = pulsarService
    this.pulsarService.socketsLogs = this.key // création des ws pour Prod/Cons des logs et envoi de ceux stockés dans le local storage
  }

  send(data: object): void {
    const obj = JSON.stringify(data)
    console.log('PULSAR DATA', obj)
    this.pulsarService.sendLogsToPulsar(this.key, obj)
  }
}
