export const environment = {
  // Production or dev modes
  production: true,

  // If true, shows some information and a few controls for debugging
  // in the bottom right corner of the application window
  devLabel: true,

  // Enable/Disable Netflux console logs
  netfluxLog: true,

  // Configuration for WebRTC (e.g. STUN/TURN servers)
  // See https://developer.mozilla.org/en/docs/Web/API/RTCConfiguration
  rtcConfiguration: {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  },

  // Signaling server URL
  // See https://github.com/coast-team/sigver
  signalingServer: 'ws://localhost:8010',

  // Enable/Disable service worker
  serviceWorker: true,

  // Whether MUTE should try to look for a Bot Storage
  // Can be an empty array: []
  // See https://github.com/coast-team/mute-bot-storage
  botStorage: {},

  encryption: true,

  // Authentication providers
  auth: {
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
