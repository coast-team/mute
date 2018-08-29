import { EncryptionType } from '../app/core/crypto/EncryptionType'
import { IEnvironment } from './IEnvironment'

export const environment: IEnvironment = {
  production: false,
  debug: {
    visible: true,
    log: {
      netflux: false,
      crypto: false,
      doc: false,
    },
  },
  p2p: {
    rtcConfiguration: {
      iceServers: [
        {
          urls: ['turn:164.132.231.106:5349?transport=udp'],
          username: 'user',
          credential: 'password',
        },
      ],
    },
    signalingServer: 'ws://cpi2.loria.fr:10000',
  },
  cryptography: {
    type: EncryptionType.NONE,
  },
  // botStorage: {}
  // authentication: {
  //   baseUrl: '',
  //   providers: {},
  // },
}
