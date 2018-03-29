// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  devLabel: true,
  netfluxLog: false,
  rtcConfiguration: { iceServers: [] },
  signalingServer: 'ws://localhost:8010',
  serviceWorker: false,
  botStorage: {
    secure: false,
    url: 'localhost:20000',
    webSocketPath: 'ws',
    isAnonymousAllowed: false,
  },
  auth: {
    baseUrl: 'http://localhost:4000/',
    providers: {
      github: { clientId: 'aa9276bbe09317cace57', scope: ['user:email'] },
      google: {
        clientId: '900988055557-r0u3sq6o1rg2t3tjidh7pq2h0nbjpp3d.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      },
    },
  },
}
