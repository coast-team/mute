export const environment = {
  production: true,
  devLabel: true,
  netfluxLog: true,
  iceServers: [
    {
      urls: ['turn:192.168.0.101:3478?transport=udp', 'turn:192.168.0.101:3478?transport=tcp'],
      username: 'user',
      credential: 'password'
    }
  ],
  signalingURL: 'ws://192.168.0.101:8000',
  serviceWorker: false,
  storages: [{
    secure: false,
    host: '192.168.0.101',
    port: 8100
  }],
  auth: {
    baseUrl: '',
    providers: {}
  }
}
