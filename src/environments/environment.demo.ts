export const environment = {
  production: true,
  devLabel: false,
  netfluxLog: false,
  rtcConfiguration: {
    iceServers: [
      {
        urls: ['turn:164.132.231.106:5349?transport=udp'],
        username: 'user',
        credential: 'password',
      },
    ],
  },
  signalingServer: 'ws://cpi2.loria.fr:10000',
  serviceWorker: false,
  botStorage: {},
  encryption: false,
  auth: {
    baseUrl: '',
    providers: {},
  },
}
