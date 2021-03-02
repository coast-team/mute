import { IEnvironment } from './IEnvironment'
import { environment as defaultEnvironment } from './environment'

const host = 'coedit.re'

export const environment: IEnvironment = {
  ...defaultEnvironment, // we extend the default environment

  production: true,

  p2p: {
    // Signaling server URL
    // See https://github.com/coast-team/sigver
    signalingServer: `wss://${host}:10443`,
  },

  /*
  // Whether MUTE should try to look for a Bot Storage
  // See https://github.com/coast-team/mute-bot-storage
  botStorage: {
    httpURL: `https://${host}:20000`,
    wsURL: `wss://${host}:20000`,
    isAnonymousAllowed: false
  },

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

  pulsar: {
    wsURL: `wss://${host}:8080/ws/v2`
  }
  */
}