export const environment = {
  // Production or dev modes
  production: true,

  // If true, shows some information and a few controls for debugging
  // in the bottom right corner of the application window
  devLabel: true,

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
  signalingURL: 'wss://www.coedit.re:10443',

  // Whether MUTE should try to look for a Bot Storage
  // Can be an empty array: []
  // See https://github.com/coast-team/mute-bot-storage
  storages: [
    {
      secure: true, // If true: https & wss protocols are used
      host: 'www.coedit.re', // Server hostname or IP address
      port: 11443 // Server port
    }
  ]
}
