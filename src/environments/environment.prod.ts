export const environment = {
  // Production or dev modes
  production: true,

  // If true, shows some information and a few controls for debugging
  // in the bottom right corner of the application window
  devLabel: true,

  // Enable/Disable Netflux console logs
  netfluxLog: true,

  // STUN/TURN servers for WebRTC
  // Can be an empty array: []
  // See https://developer.mozilla.org/en/docs/Web/API/RTCIceServer/urls
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ],

  // Signaling server URL
  // See https://github.com/coast-team/sigver
  signalingURL: 'wss://signaling.coedit.re',

  // Enable/Disable service worker
  serviceWorker: true,

  // Whether MUTE should try to look for a Bot Storage
  // Can be an empty array: []
  // See https://github.com/coast-team/mute-bot-storage
  storages: [
    {
      secure: true, // If true: https & wss protocols are used
      host: 'botstorage.coedit.re', // Server hostname or IP address
      port: 443 // Server port
    }
  ],

  // Authentication providers
  auth: {
    baseUrl: 'https://auth.coedit.re/',
    providers: {
      github: { clientId: '', scope: [] }, // Github application clientId
      google: { clientId: '', scope: [] }  // Google application clientId
    }
  }
}
