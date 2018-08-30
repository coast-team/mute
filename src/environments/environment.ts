import { LogLevel } from 'netflux'
import { EncryptionType } from '../app/core/crypto/EncryptionType'
import { IEnvironment } from './IEnvironment'

export const environment: IEnvironment = {
  production: false,
  debug: {
    visible: true,
    log: {
      netflux: [],
      crypto: true,
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
    type: EncryptionType.KEY_AGREEMENT_BD,
    // coniksClient: {
    //   url: 'https://localhost:3001', // Coniks clinet URL (must be a localhost)
    //   binaries: {
    //     linux: '',
    //     windows: '',
    //     macOS: '',
    //   },
    // },
  },
  // botStorage: {
  //     httpURL: 'http://localhost:20000',
  //     wsURL: 'ws://localhost:20000',
  //     isAnonymousAllowed: false,
  // },
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
