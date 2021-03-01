# MUTE: Multi User Text Editor

Edit documents collaboratively in real-time with hundreds of users on the same document, even with a light server. MUTE implements a CRDT-based consistency algorithm for large scale peer-to-peer collaboration: [LogootSplit](https://github.com/coast-team/mute-structs#ref-1). This algorithm can be seen as an extension for variable-sized elements (e.g. strings) of one of the basic CRDT algorithms for unit elements (e.g. characters).

You can check:

- our live demonstration server at <https://www.coedit.re>
- or quickstart MUTE on your machine via `npm start` and then access it on <http://localhost:4200>

## :package: Deployment

MUTE runs in the browser, which means that modifications are sent directly to your peers without any intermediary server. However the peer-to-peer technology requires a few servers for discovery and signaling. A complete MUTE instance relies on the following servers:

- your web server serving the MUTE static files over HTTPS
- a WebSocket signaling server which is mandatory in order to establish a connection between two users
- an (optional but highly recommended) STUN/TURN server to establish peer-to-peer connection _in some scenarios_ (a user is behind a NAT for example)

MUTE comes with a default STUN server that is already deployed.

Proceed with the following steps:

1.  Deploy the signaling server ([how to](https://github.com/coast-team/sigver))
2.  Build MUTE static files ([how to](#build))
3.  Serve static files

> TIP: If you serve MUTE via HTTPS, the Signaling server should also be secure, i. e. available via `wss` protocol.
>
> TIP: You may find a full NGINX configuration example in the `conf` folder

## :book: Documentation

- [Demo deployment on Raspberry Pi](https://github.com/coast-team/mute/wiki/Deploy:-Raspberry-Pi)
- [Production deployment with NGINX on Ubuntu 16.04](https://github.com/coast-team/mute/wiki/Deploy:-Production)

## :bar_chart: Benchmark

> NOTE: more automated/replicable benchmarks will be added in the future

Compared to existing web-based collaborative text editing tools, MUTE does not require a powerful central server since the server is not performing any computation. You can even work offline and reconnect later without losing your changes.

In our experience, performance drops significantly after reaching tens of users on a document on centralized platforms.

## :hammer_and_wrench: Architecture

Communication between browsers editing a document is done in a peer-to-peer fashion thanks to our [Netflux](https://github.com/coast-team/netflux) and [sigver](https://github.com/coast-team/sigver) (signaling) libraries.

MUTE relies on other reusable libraries we develop:

- [@coast-team/mute-core](https://github.com/coast-team/mute-core): core component ensuring typical document-editing operations are done in an orderly fashion
- [@coast-team/mute-structs](https://github.com/coast-team/mute-structs): an implementation of the LogootSplit CRDT algorithm
- [@coast-team/mute-crypto](https://github.com/coast-team/mute-crypto): a group cryptographic key agreement implementation using [Burmester and Desmedt's algorithm](https://github.com/coast-team/mute-crypto)

## License

Copyright (C) 2016-2021 COAST

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
