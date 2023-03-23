import { CryptoService } from '@app/core/crypto/crypto.service'
import { StreamId } from '@coast-team/mute-core'
import { Libp2p } from 'libp2p/dist/src'
import { Subject } from 'rxjs/internal/Subject'
import { PeersGroupConnectionStatus } from '@app/doc/network/network.service.abstracted'

// This interface represents a generic class that should handle the network functions of the mute project
export interface INetworkSolution {
  myNetworkId: Subject<number>
  peers: number[]
  neighbors: number[]
  peersGroupConnectionStatusSubject: Subject<PeersGroupConnectionStatus>
  memberJoinSubject: Subject<number>
  memberLeaveSubject: Subject<number>
  cryptoService: CryptoService

  readonly USE_GROUP: boolean
  readonly USE_SERVER: boolean

  send: (streamId: StreamId, content: Uint8Array, peers: number[], id?: number) => void

  sendToAll: (message: Uint8Array) => void

  sendRandom: (message: Uint8Array) => void

  sendTo: (recipientNetworkId: number, message: Uint8Array) => void

  joinNetwork: (key: string) => void

  leaveNetwork: () => void

  setAndInitCryptoService: (cryptoService: CryptoService) => void

  configureNetworkBehavior: (libp2pInstance?: Libp2p) => void
}
