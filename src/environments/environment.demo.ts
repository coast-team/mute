export const environment = {
  production: true,
  devLabel: false,
  iceServers: [
    {
      urls: 'stun.l.google.com:19302'
    },
    {
      urls: ['turn:example.turn.com:80?transport=udp', 'turn:example.turn.com:80?transport=tcp'],
      username: 'user',
      credential: 'password'
    }],
  signalingURL: 'ws://192.168.0.100:8000',
  storages: []
}
