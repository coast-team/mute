export const environment = {
  production: true,
  devLabel: true,
  netfluxLog: true,
  rtcConfiguration: {
    iceServers: [
      {
        urls: ['turn:192.168.0.100:3478?transport=udp'],
        username: 'user',
        credential: 'password'
      }
    ]
  },
  signalingServer: 'ws://192.168.0.100:10000',
  serviceWorker: false,
  storages: [{
    secure: false,
    host: '192.168.0.100',
    port: 11000
  }],
  auth: {
    baseUrl: '',
    providers: {}
  }
}
