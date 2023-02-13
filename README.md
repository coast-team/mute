<a href="https://gitlab.inria.fr/coast-team/mute/mute">
  <img src="https://gitlab.inria.fr/coast-team/mute/mute/-/raw/main/src/assets/images/icons/icon-512x512.png?inline=false" alt="MUTE logo" title="MUTE" align="right" height="60" />
</a>

# MUTE: Multi User Text Editor

Edit documents collaboratively in real-time with hundreds of users on the same document, even with a light server. MUTE implements a CRDT-based consistency algorithm for large scale peer-to-peer collaboration: [LogootSplit](https://github.com/coast-team/mute-structs#ref-1). This algorithm can be seen as an extension for variable-sized elements (e.g. strings) of one of the basic CRDT algorithms for unit elements (e.g. characters).

You can either:

- check our [live demo](mutehost.loria.fr)
- or run MUTE on your machine via `npm start` and then access it on [localhost:4200](http://localhost:4200)

## :package: Deployment

MUTE runs in the browser, which means that modifications are sent directly to your peers without any intermediary server. However the peer-to-peer technology requires at least a server for the initial discovery and signaling phase. A complete MUTE instance relies on the following services:

- web server of your choice serving the MUTE static files over HTTPS
- [SigVer](https://github.com/coast-team/sigver) signaling server
- (in WebRTC-unfriendly networks) [Pulsar](https://github.com/apache/pulsar) server *NOT AVAILABLE YET*

Read more in our [deployment documentation](https://gitlab.inria.fr/coast-team/mute/mute/-/wikis/Deployment).

## :book: Development

Run `npm install` and start the build/serve watchdog with `npm start`. The application is now available at [localhost:4200](http://localhost:4200) with the signaling server running at [localhost:8010](http://localhost:8010).)

## :bar_chart: Benchmark

> NOTE: more automated/replicable benchmarks will be added in the future

Compared to existing web-based collaborative text editing tools, MUTE does not require a powerful central server since the server is not performing any computation. You can even work offline and reconnect later without losing your changes.

In our experience, performance drops significantly after reaching tens of users on a document on centralized platforms. MUTE doesn't process changes server-side, allowing much larger groups to collaboratively edit a document.

## :hammer_and_wrench: Architecture

MUTE relies on other libraries we develop, which you can reuse in your projects:

- [@coast-team/mute-core](https://github.com/coast-team/mute-core): core component ensuring typical document-editing operations are done in an orderly fashion
- [@coast-team/mute-structs](https://github.com/coast-team/mute-structs): an implementation of the [LogootSplit](https://github.com/coast-team/mute-structs#ref-1) CRDT algorithm
- [@coast-team/mute-crypto](https://github.com/coast-team/mute-crypto): a group cryptographic key agreement implementation using [Burmester and Desmedt's algorithm](https://github.com/coast-team/mute-crypto)
- [@coast-team/mute-auth-proxy](https://github.com/coast-team/mute-auth-proxy): assign public/private key pairs to autenticated users, for later use in mute-crypto

MUTE also has a pluggable system of services called *Bots*. They can act like peers in documents to provide
services:

- [@coast-team/mute-bot-storage](https://github.com/coast-team/mute-bot-storage): stores documents for others when you are offline

MUTE exchanges messages by default over WebRTC via:

- [netflux](https://github.com/coast-team/netflux): peer-to-peer browser communication layer
- [sigver](https://github.com/coast-team/sigver): signaling for WebRTC

In the future, any communication layer could be used, like [Pulsar](https://github.com/apache/pulsar) which we support already for increased reliability!

One of the best ways to contribute to MUTE is to help these libraries!

## License

Copyright (C) 2016-2022 [COAST](https://team.inria.fr/coast)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
