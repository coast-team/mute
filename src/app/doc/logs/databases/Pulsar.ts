import { PulsarService } from '../../network/pulsar.service'
import { ILogDatabase } from './ILogDatabase.model'

export class Pulsar implements ILogDatabase {
  private key: string
  private pulsarService: PulsarService

  constructor (docKey: string) {
    this.key = docKey
    // this.pulsarService.socketsLogs = this.key // création des ws pour Prod/Cons des logs et envoi de ceux stockés dans le local storage
  }

  /**
   * Setup stream logs for Pulsar ; shouldn't be used if no pulsar available
   * @param pulsarService PulsarService
   */
  subscribeToWs (pulsarService: PulsarService) {
    this.pulsarService = pulsarService
    if (!this.pulsarService.isOperational()) return

    this.pulsarService.socketsLogs = this.key // création des ws pour Prod/Cons des logs et envoi de ceux stockés dans le local storage
  }

  send (data: any) {
    if (!this.pulsarService.isOperational()) return

    const obj = JSON.stringify(data)
    console.log('PULSAR LOGS DATA', obj)
    this.pulsarService.sendLogsToPulsar(this.key, obj)
  }
}
