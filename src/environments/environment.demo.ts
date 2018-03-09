export const environment = {
  production: true,
  devLabel: false,
  netfluxLog: false,
  rtcConfiguration: {
    iceServers: [
      {
        urls: ['turn:192.168.0.100:3478?transport=udp'],
        username: 'user',
        credential: 'password'
      }
    ]
  },
  signalingServer: 'ws://cpi1.loria.fr:10000',
  serviceWorker: false,
  storages: [],
  auth: {
    baseUrl: '',
    providers: {}
  }
}
