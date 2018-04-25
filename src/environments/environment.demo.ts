export const environment = {
  commit: '',
  production: true,
  devLabel: false,
  netfluxLog: false,
  rtcConfiguration: {
    iceServers: [
      {
        urls: ['turn:192.168.0.100:3478?transport=udp'],
        username: 'user',
        credential: 'password',
      },
    ],
  },
  signalingServer: 'ws://cpi2.loria.fr:10000',
  serviceWorker: false,
  botStorage: {
    secure: true,
    url: 'botstorage.coedit.re',
    webSocketPath: 'ws',
    isAnonymousAllowed: true,
  },
  auth: {
    baseUrl: '',
    providers: {},
  },
}
