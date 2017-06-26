export const environment = {
  production: true,
  devLabel: true,
  iceServers: [
  {
    urls: 'stun.l.google.com:19302'
  },
  {
    urls: ['turn:example.turn.com:5349?transport=udp', 'turn:example.turn.com:5349?transport=tcp'],
    username: 'user',
    credential: 'password'
  }],
  signalingURL: 'wss://www.coedit.re:10443',
  storages: [
    {secure: true, host: 'www.coedit.re', port: 11443}
  ]
}
