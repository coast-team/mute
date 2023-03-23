import { Strategy } from '@coast-team/mute-core'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { networkSolution } from '@app/doc/network/solutions/networkSolution'

export enum NetfluxLogLevel {
  DEBUG = 0,
  WEB_GROUP = 1,
  WEBRTC = 2,
  CHANNEL = 3,
  TOPOLOGY = 4,
  SIGNALING = 5,
  CHANNEL_BUILDER = 6,
}

export interface IEnvironment {
  production: boolean

  crdtStrategy: Strategy

  network: networkSolution

  debug: {
    visible: boolean
    log: {
      netflux: NetfluxLogLevel[]
      crypto: boolean
      doc: boolean
    }
  }

  p2p: {
    /**
     * Parameters for the connection to the signaling server
     */
    rtcConfiguration: RTCConfiguration

    /**
     * We provide one by default: sigver
     */
    signalingServer: string
    signalingServerTestAddr?: string // If the address of the signaling server to test is ws:// or http://
  }

  cryptography: {
    type: EncryptionType

    coniksClient?: {
      url: string
      binaries: {
        linux: string
        windows: string
        macOS: string
      }
    }

    keyserver?: {
      urlPrefix: string
    }
  }

  botStorage?: {
    httpURL: string
    wsURL: string
    isAnonymousAllowed: boolean
  }

  authentication?: {
    baseUrl: string
    providers: {
      github: {
        clientId: string
        scope: [string]
      }
      google: {
        clientId: string
        scope: [string, string]
      }
    }
  }

  pulsar?: {
    wsURL: string
    anonymize?: boolean
  }
}
