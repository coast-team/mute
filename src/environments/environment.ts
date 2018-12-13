import { Strategy } from '@coast-team/mute-core'
import { LogLevel } from 'netflux'
import { EncryptionType } from '../app/core/crypto/EncryptionType'
import { IEnvironment } from './IEnvironment'

export const environment: IEnvironment = {
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
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    },
    signalingServer: 'ws://localhost:8010',
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
  logSystem: {
    logCollectorUrl: 'ws://localhost:24000/ws', // 'wss://logs.dev.coedit.re',
    stompjsDebugLog: false,
    anonimyze: true,
  },
  botStorage: {
    httpURL: 'http://localhost:20000',
    wsURL: 'ws://localhost:20000',
    isAnonymousAllowed: false,
  },
  authentication: {
    baseUrl: 'http://localhost:4000/',
    providers: {
      github: { clientId: 'f936a2022e9e03ae004a', scope: ['user:email'] },
      google: {
        clientId: '266602967129-rpub82t4tln6b2q9bl80ht3a18bpbrp4.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      },
    },
  },
}
