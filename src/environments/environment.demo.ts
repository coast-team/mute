import { Strategy } from '@coast-team/mute-core'
import { EncryptionType } from '../app/core/crypto/EncryptionType'
import { IEnvironment } from './IEnvironment'

export const environment: IEnvironment = {
  production: false,
  crdtStrategy: Strategy.LOGOOTSPLIT,
  debug: {
    visible: true,
    log: {
      netflux: [],
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
  logSystem: {
    logCollectorUrl: 'ws://localhost:15674/ws',
    stompjsDebugLog: false,
    anonimyze: false,
  },
  // botStorage: {}
  // authentication: {
  //   baseUrl: '',
  //   providers: {},
  // },
}
