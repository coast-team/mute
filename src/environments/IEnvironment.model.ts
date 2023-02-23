import { Strategy } from '@coast-team/mute-core'
import { LogLevel } from 'netflux'
import { EncryptionType } from '../app/core/crypto/EncryptionType.model'

export interface IEnvironment {
  production: boolean

  crdtStrategy: Strategy

  debug: {
    visible: boolean
    log: {
      netflux: LogLevel[]
      crypto: boolean
      doc: boolean
    }
  }

  p2p: {
    /**
     * We provide one by default: sigver
     */
    signalingServer: string

    /**
     * Parameters for the connection to the signaling server
     */
    rtcConfiguration?: RTCConfiguration
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
