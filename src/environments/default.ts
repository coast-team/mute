import { Strategy } from '@coast-team/mute-core'
import { LogLevel } from 'netflux'

import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { IEnvironment } from './IEnvironment.model'

export const defaultEnvironment: IEnvironment = {
  production: false,

  crdtStrategy: Strategy.LOGOOTSPLIT,

  debug: {
    visible: true,
    log: {
      netflux: [LogLevel.DEBUG],
      crypto: false,
      doc: false,
    },
  },

  p2p: {
    rtcConfiguration: {
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org'
        },
        {
          urls: 'stun:stun.framasoft.org'
        }
      ],
    },
    signalingServer: 'ws://localhost:8010', // sigver, run automatically on local development ;-)
  },

  cryptography: {
    type: EncryptionType.METADATA,
    // coniksClient: {
    //   url: 'https://localhost:3001', // Coniks clinet URL (must be a localhost)
    //   binaries: {
    //     linux: '',
    //     windows: '',
    //     macOS: '',
    //   },
    // },
    // keyserver: {
    //   urlPrefix: 'http://localhost:4000/public-key',
    // },
  }
}
