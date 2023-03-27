<a href="https://gitlab.inria.fr/coast-team/mute/mute">
  <img src="https://gitlab.inria.fr/coast-team/mute/mute/-/raw/main/src/assets/images/icons/icon-512x512.png?inline=false" alt="MUTE logo" title="MUTE" align="right" height="60" />
</a>

# MUTE: Multi User Text Editor

Edit documents collaboratively in real-time with hundreds of users on the same document, even with a light server. MUTE implements a CRDT-based consistency algorithm ([LogootSplit](#hammer_and_wrench-architecture)) for large scale peer-to-peer collaboration on top of a peer-to-peer message layer ([libp2p](#hammer_and_wrench-architecture)).

<div align="center"> <!-- extra line is important for proper markdown evaluation-->
<a href="https://gitlab.inria.fr/coast-team/mute/mute">

![](https://gitlab.inria.fr/coast-team/mute/mute/uploads/b2363cb860a073fc277b9b62f2bc4bae/mute.jpeg){width=75%}
</a>

[stable demo](https://mute.loria.fr) · [bleeding-edge demo](https://main.mute.loria.fr)
</div>

## :package: Deployment

MUTE is browser-based, without any intermediary between you and your peers. However the peer-to-peer initial discovery and signaling requires at least a (lightweight) server.

Read more in our [deployment documentation](https://gitlab.inria.fr/coast-team/mute/mute/-/wikis/Deployment)

## :book: Development

Run `npm install` then `npm start`. The application is now available at [localhost:4200](http://localhost:4200), the signaling server at [localhost:8010](http://localhost:8010).

Development happens on the INRIA GitLab repository, but external contributions are very welcome on the [GitHub mirror](https://github.com/coast-team/mute/) we maintain.

Read more in our [development documentation](https://gitlab.inria.fr/coast-team/mute/mute/-/wikis/Development)

## :bar_chart: Benchmark

Compared to existing web-based collaborative text editing tools, MUTE does not require a powerful central server since the server is not performing any computation. You can even work offline and reconnect later without losing your changes.

While centralized alternatives suffer significant performance drops after reaching tens of users on a document, MUTE remains unfazed. This is due to its architecture: MUTE doesn't process changes server-side, allowing much larger groups to collaboratively edit a document.

### Memory/Latency
<!-- load graph for local app -->
[Load testing](https://github.com/coast-team/replication-benchmarker) has been done for the core algorithms that represent the main computation done locally:

> Mehdi Ahmed-Nacer, Claudia-Lavinia Ignat, Gérald Oster, Hyun-Gul Roh, and Pascal Urso. 2011. Evaluating CRDTs for real-time document editing. In Proceedings of the 11th ACM symposium on Document engineering (DocEng '11). Association for Computing Machinery, New York, NY, USA, 103–112. https://doi.org/10.1145/2034691.2034717

> Loïck Briot, Pascal Urso, and Marc Shapiro. 2016. High Responsiveness for Group Editing CRDTs. In Proceedings of the 2016 ACM International Conference on Supporting Group Work (GROUP '16). Association for Computing Machinery, New York, NY, USA, 51–60. https://doi.org/10.1145/2957276.2957300

### Protocol performance

We rely on pluggable network layers, so part of the real use performance not accounted for in our benchmarks can be attributed to the underlying protocols we use for message exchanges:

- see performance reports for libp2p: https://blog.ipfs.tech/2022-06-15-probelab/
- no performance report was made for netflux, which we are now phasing out

## :hammer_and_wrench: Architecture

Document editing layer:

- [@coast-team/mute-core](https://gitlab.inria.fr/coast-team/mute/mute-modules/mute-core): core component ensuring typical document-editing operations are done in an orderly fashion
- [@coast-team/mute-structs](https://gitlab.inria.fr/coast-team/mute/mute-modules/mute-structs): an implementation of the [LogootSplit](https://gitlab.inria.fr/coast-team/mute/mute-modules/mute-structs#ref-1) CRDT algorithm. This algorithm can be seen as an extension for variable-sized elements (e.g. strings) of one of the basic CRDT algorithms for unit elements (e.g. characters).

Security layer:

- [@coast-team/mute-crypto](https://gitlab.inria.fr/coast-team/mute/mute-modules/mute-crypto): a group cryptographic key agreement implementation using [Burmester and Desmedt's algorithm](https://gitlab.inria.fr/coast-team/mute/mute-modules/mute-crypto)

P2P Network layer:

- [libp2p](https://libp2p.io): modern peer-to-peer browser communication layer
  - [@libp2p/webrtc-star-signalling-server](https://www.npmjs.com/package/@libp2p/webrtc-star-signalling-server): signaling for libp2p via WebRTC

Legacy P2P network layer:

- [netflux](https://github.com/coast-team/netflux): peer-to-peer browser communication layer
- [@coast-team/sigver](https://github.com/coast-team/sigver): signaling for netflux via WebRTC

Non-P2P network layer backup:

- [pulsar](https://github.com/apache/pulsar) for increased reliability in networks banning WebRTC

## License

Copyright (C) 2016-2023 [COAST](https://team.inria.fr/coast)

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
