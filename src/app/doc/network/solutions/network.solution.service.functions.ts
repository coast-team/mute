import { CryptoService } from '@app/core/crypto'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { environment } from '@environments/environment'
import { Message } from '../message_proto'
import { Subject } from 'rxjs/internal/Subject'
import { Streams as MuteCryptoStreams } from '@coast-team/mute-crypto'
import { StreamId, Streams as MuteCoreStreams } from '@coast-team/mute-core'

// This class serves as the declaration of common functions used in the network solutions
export class NetworkSolutionServiceFunctions {
  //Sending data
  send(streamId: StreamId, content: Uint8Array, peers: number[], id?: number): void {
    if (peers.length >= 1) {
      const msg = Message.create({ type: streamId.type, subtype: streamId.subtype, content })
      if (id === undefined) {
        this.sendToAll(Message.encode(msg).finish())
      } else {
        if (id === 0) {
          this.sendRandom(Message.encode(msg).finish())
        } else {
          this.sendTo(id, Message.encode(msg).finish())
        }
      }
    }
  }

  // Send functions defined in each solutions service
  sendToAll(message: Uint8Array): void {}
  sendRandom(message: Uint8Array): void {}
  sendTo(recipientNetworkId: number, message: Uint8Array): void {}

  /**
   * Handles the receiving process, wether we are using encryption or not
   * @param bytes the data received as bytes
   * @param messageReceived observable related to message received on the network
   * @param networkId the network id of the sender
   * @param cryptoService cryptoservice used for crypto related functions
   */
  handleIncomingMessage(
    bytes: Uint8Array,
    messageReceived: Subject<{ streamId: StreamId; content: Uint8Array; senderNetworkId: number }>,
    networkId: number,
    cryptoService: CryptoService
  ): void {
    const { type, subtype, content } = Message.decode(bytes)
    if (type === MuteCryptoStreams.KEY_AGREEMENT_BD) {
      cryptoService.onBDMessage(networkId, content)
    }
    if (type === MuteCoreStreams.DOCUMENT_CONTENT && environment.cryptography.type !== EncryptionType.NONE) {
      cryptoService.decrypt(content).then((decryptedContent) => {
        messageReceived.next({ streamId: { type, subtype }, content: decryptedContent, senderNetworkId: networkId })
      })
      return
    }
    messageReceived.next({ streamId: { type, subtype }, content, senderNetworkId: networkId })
  }

  randomPeer(peers: number[]): number {
    return peers[Math.ceil(Math.random() * peers.length) - 1]
  }
}
