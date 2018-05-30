// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  devLabel: true,
  netfluxLog: false,
  rtcConfiguration: {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302'],
      },
    ],
  },
  signalingServer: 'ws://localhost:8010',
  serviceWorker: false,
  botStorage: {},
  encryption: false,
  auth: {
    baseUrl: 'http://localhost:4000/',
    providers: {
      github: { clientId: 'f936a2022e9e03ae004a', scope: ['user:email'] },
      google: {
        clientId: '266602967129-rpub82t4tln6b2q9bl80ht3a18bpbrp4.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      },
    },
  },
}
