import { Strategy } from '@coast-team/mute-core'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { networkSolution } from '@app/doc/network/solutions/networkSolution'
import { IEnvironment, NetfluxLogLevel } from './IEnvironment.model'

const host = 'localhost' // FIXME: interpolation at build time required

export const defaultEnvironment: IEnvironment = {
  production: false,

  network: networkSolution.LIBP2P,

  crdtStrategy: Strategy.LOGOOTSPLIT,

  debug: {
    visible: true,
    log: {
      netflux: [NetfluxLogLevel.DEBUG],
      crypto: false,
      doc: false,
    },
  },

  p2p: {
    rtcConfiguration: {
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org',
        },
        {
          urls: 'stun:stun.framasoft.org',
        },
      ],
    },
    //libp2p value
    signalingServer: `/dns4/${host}/tcp/8010/ws/p2p-webrtc-star/`,
    signalingServerTestAddr: `http://${host}:8010`,
    //netflux value
    //signalingServer: `ws://localhost:8010`,
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
  },
}
