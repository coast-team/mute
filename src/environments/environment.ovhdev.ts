export const environment = {
  production: true,
  devLabel: true,
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ],
  signalingURL: 'wss://www.coedit.re:20443',
  storages: [
    {secure: true, host: 'www.coedit.re', port: 21443}
  ]
}
