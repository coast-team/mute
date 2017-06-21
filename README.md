# MUTE: Multi User Text Editor

Web-based text editing tool that allows to edit documents collaboratively in real-time. It implements a CRDT-based consistency maintenance algorithm for strings for peer-to-peer large scale collaboration. This algorithm called LogootSplit can be seen as an extension for variable-sized elements (e.g. strings) of one of the basic CRDT algorithms for unit elements (e.g. characters). Compared to existing web-based collaborative text editing tool MUTE does not require a powerful central server since the server is not performing any computation. Communication between editor instances is done in a peer-to-peer manner thanks to the Netflux library that is based on WebRTC technology. Our editor offers support for working offline while still being able to reconnect at a  later time.

**Demo**: https://www.coedit.re

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.1.2.

## Deploy your own instance
MUTE is a peer-to-peer collaborative editor in the browser, which means that any user sends his modifications directly to other collaborators instead of transmitting them via a server. However the peer-to-peer technology requires a few servers for full working capacity. Thus the complete MUTE instance is composed of the following servers:

- HTTP(S) server serving MUTE static files.
- WebSocket signaling server which is mandatory in order to establish a connection between two users.
- STAN/TURN help to establish peer-to-peer connection in some scenarios (user is behind a NAT for example).

MUTE comes with a default free STAN server (already deployed on the Internet). TURN server deployment is out of scope of this guide.

Proceeds the following steps:

1. Deploy Signaling server ([how to](https://github.com/coast-team/sigver)).
2. Build MUTE static files ([how to](#build)).
3. Serve static files.

> TIP: If you serve MUTE via HTTPS, the Signaling server should also be secure, i. e. available via `wss` protocol.

> TIP: You may find NGINX configuration example in the `conf` folder

## Build
Before building the project (creating the static files) you may need to specify a few building parameters in `src/environments/environments.prod.ts`:

```javascript
{
  // Production or dev modes.
  production: boolean, 

  // If true, shows some information and a few controls for debugging
  // in the bottom right corner of the application window.
  devLabel: boolean,

  // If true MUTE will use free TURN server. Its payload is limited and
  // it is mainly aimed for testing.
  fetchIceServers: boolean,

  // WebSocket Signaling server URL (e.g. 'wss://mysignaling.com').
  signalingURL: string,

  // Whether MUTE should try to look for a Bot Storage.
  // Can be an empty array: [].
  // See https://github.com/coast-team/mute-bot-storage
  storages: [
    {
      // Whether the mute bot storage server is secure (https, wss)
      secure: boolean,

      // Server hostname or IP address
      host: 'localhost',

      // Server port
      port: 20000
    }
  ]
}
```
Once the configurations are set, run `npm run build` command to build the project for production. The build artifacts will be stored in the `dist/` directory.

### Docker image

A basic `Dockerfile` is provided. It is based on the official [NGINX](https://hub.docker.com/_/nginx/) container (built on top of [Alpine Linux](https://alpinelinux.org/)) that will serve the packaged angular application.

Run `npm run build` to build the application.
Then, run `docker build -t 'coast-team/mute' .` to build the container image.

You can start a new container using the following command `docker run -it -p 80:80 coast-team/mute`.

## Developer guide
### Development server
Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

**To test Service Worker**: 
Run `npm run start-sw` and navigate to `http://localhost:4300/`. 

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
