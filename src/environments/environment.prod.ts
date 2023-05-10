import { IEnvironment } from './IEnvironment.model'
import { defaultEnvironment } from './default'
import { EncryptionType } from '@app/core/crypto/EncryptionType.model'
import { networkSolution } from '@app/doc/network/solutions/networkSolution'

const host = 'prod-signaling.mute.loria.fr' // FIXME: interpolation at build time required

export const environment: IEnvironment = {
  ...defaultEnvironment, // we extend the default environment

  network: networkSolution.LIBP2P,

  production: true,

  p2p: {
    rtcConfiguration: defaultEnvironment.p2p.rtcConfiguration,
    // Signaling server URL
    // See https://github.com/coast-team/sigver
    signalingServer: `/dns4/${host}/tcp/443/wss/p2p-webrtc-star/`,
    signalingServerTestAddr: `https://${host}`,
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

  /*
  // Whether MUTE should try to look for a Bot Storage
  // See https://github.com/coast-team/mute-bot-storage
  botStorage: {
    httpURL: `https://${host}:20000`,
    wsURL: `wss://${host}:20000`,
    isAnonymousAllowed: false
  },
  */

  /*
  authentication: {
    baseUrl: `https://${host}:4000/`,
    providers: {
      github: { clientId: 'f936a2022e9e03ae004a', scope: ['user:email'] },
      google: {
        clientId: '266602967129-rpub82t4tln6b2q9bl80ht3a18bpbrp4.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      }
    }
  },
  */

  /*
  pulsar: {
    wsURL: `wss://${host}:8080/ws/v2`
  }
  */
}
