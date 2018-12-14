# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.12.1"></a>
## [0.12.1](https://github.com/coast-team/mute/compare/v0.12.0...v0.12.1) (2018-12-14)


### Bug Fixes

* **tsconfig:** change target to es2015 ([8092bfc](https://github.com/coast-team/mute/commit/8092bfc))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/coast-team/mute/compare/v0.11.0...v0.12.0) (2018-12-13)


### Features

* **doc:** change offset by index in IDocContentOperation ([60321d8](https://github.com/coast-team/mute/commit/60321d8))
* **docservice:** update with the new IDocContentOperation ([776b7ec](https://github.com/coast-team/mute/commit/776b7ec))
* **editorcomponent:** update with the new IDocContentOperation ([261682a](https://github.com/coast-team/mute/commit/261682a))
* **environment:** add the mute-core strategy ([af231df](https://github.com/coast-team/mute/commit/af231df))
* **logs:** updated code with the new logs name in mute-core ([bdb0bf2](https://github.com/coast-team/mute/commit/bdb0bf2))
* **mutecore:** adapting code with the new mute-core api ([2e240c3](https://github.com/coast-team/mute/commit/2e240c3))
* **package.json:** update mute-core to v9.1.0 ([cfc8c53](https://github.com/coast-team/mute/commit/cfc8c53))
* **pki:** add new pki (for Key Agreement) ([fab1d38](https://github.com/coast-team/mute/commit/fab1d38))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/coast-team/mute/compare/v0.10.0...v0.11.0) (2018-11-21)


### Features

* **state:** load document with the stored state ([647bc94](https://github.com/coast-team/mute/commit/647bc94))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/coast-team/mute/compare/v0.9.0...v0.10.0) (2018-11-15)


### Bug Fixes

* **cursor.proto:** change the import path for sync.proto ([dc4da6b](https://github.com/coast-team/mute/commit/dc4da6b))
* **docslist:** fix a bug when a doc was in trash and in remote storage ([d193552](https://github.com/coast-team/mute/commit/d193552))
* **download:** fix Logs file download function ([7ff13ef](https://github.com/coast-team/mute/commit/7ff13ef))
* **download:** muteLogs generated file is now a correct JSON file ([72b2952](https://github.com/coast-team/mute/commit/72b2952))
* **localOperation:** Logs now subscribe first, in order to read clock and state before the operation ([4ad46b7](https://github.com/coast-team/mute/commit/4ad46b7))
* **logs:** context is convert to object before being stringify ([17079c0](https://github.com/coast-team/mute/commit/17079c0))
* **logs:** fix duplicate console logs, reload issues for logs properties ([71c830f](https://github.com/coast-team/mute/commit/71c830f))
* **logs:** fix ng2-stomp version and logs display in console ([a9eade1](https://github.com/coast-team/mute/commit/a9eade1))


### Features

* **environment:** add logSystem properties into environment object ([721ee34](https://github.com/coast-team/mute/commit/721ee34))
* **indexeddb:** delete logs db when a document is removed ([e8c6066](https://github.com/coast-team/mute/commit/e8c6066))
* **logs:** add anonymization for logs ([feeec78](https://github.com/coast-team/mute/commit/feeec78))
* **logs:** Add event when change shareLogs and logsStrategy parameters ([e93fe82](https://github.com/coast-team/mute/commit/e93fe82))
* **logs:** add logid into the logged object ([96a138d](https://github.com/coast-team/mute/commit/96a138d))
* **logs:** Add RabitMq class for sending logs to a message queue ([662a5a4](https://github.com/coast-team/mute/commit/662a5a4))
* **logs:** add remoteSiteId, and change neighbours logs ([931533f](https://github.com/coast-team/mute/commit/931533f))
* **logs:** add tooltip for explaining the log collection ([a0d3a9c](https://github.com/coast-team/mute/commit/a0d3a9c))
* **logs:** Adding shareLogs in metadata, polish rebase with master ([ea2ace1](https://github.com/coast-team/mute/commit/ea2ace1))
* **logs:** Change how we observe local and remote operations ([0e3411c](https://github.com/coast-team/mute/commit/0e3411c))
* **logs:** refactor logs content and add creation/opening log ([b974815](https://github.com/coast-team/mute/commit/b974815))
* **logsStrategy:** Refactor strategy pattern, and implements sendall strategy ([193509b](https://github.com/coast-team/mute/commit/193509b))
* **rabbitmq:** Send offline-logs which are stored in the local storage when offline ([9cd58e7](https://github.com/coast-team/mute/commit/9cd58e7))
* **shareLogs:** Add a property into Doc class, add a toggle button in order to change that property ([efc55c0](https://github.com/coast-team/mute/commit/efc55c0))
* **tooltip:** change share logs information style ([fb6f0a3](https://github.com/coast-team/mute/commit/fb6f0a3))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/coast-team/mute/compare/v0.8.1...v0.9.0) (2018-09-10)


### Bug Fixes

* **coniks:** should work without coniksClient env parameter ([87f9b3f](https://github.com/coast-team/mute/commit/87f9b3f))
* **coniks:** uncaught Promise rejection ([4ff9f2f](https://github.com/coast-team/mute/commit/4ff9f2f))
* **coniks:** verify signature on message from key agreement protocol ([d5e5d40](https://github.com/coast-team/mute/commit/d5e5d40))
* **date:** show the format correctly ([48184bb](https://github.com/coast-team/mute/commit/48184bb))
* **details:** add padding between details' lines ([47474c1](https://github.com/coast-team/mute/commit/47474c1))
* **doc:** reload page when change profile ([80c5a83](https://github.com/coast-team/mute/commit/80c5a83))
* **history:** build correctly ([db54bab](https://github.com/coast-team/mute/commit/db54bab))


### Features

* **coniks:** don't allow to open a document for non authenticated users ([d5e780a](https://github.com/coast-team/mute/commit/d5e780a))
* **coniks:** show is coniks is used ([4aa2e1f](https://github.com/coast-team/mute/commit/4aa2e1f))
* **coniks:** verify my signing public key with the one on Coniks ([70f32ab](https://github.com/coast-team/mute/commit/70f32ab))
* **crypto:** define cryptographic mechanism during a build ([3831da5](https://github.com/coast-team/mute/commit/3831da5))
* **crypto:** lookup new member's public key from coniks server ([af164d1](https://github.com/coast-team/mute/commit/af164d1))
* **crypto:** use keyagreement BD protocol instead of a key in metadata ([6a0fe1d](https://github.com/coast-team/mute/commit/6a0fe1d))
* **details:** show encryption type in details ([311e653](https://github.com/coast-team/mute/commit/311e653))
* **doc:** show digest in details ([e72653c](https://github.com/coast-team/mute/commit/e72653c))
* **docs:** sort by name, key or any date ([3c69a3f](https://github.com/coast-team/mute/commit/3c69a3f))
* **logs:** enable/disable Netflux and Crypto logs ([6830f89](https://github.com/coast-team/mute/commit/6830f89))
* **signingkey:** generate private and public key if not exist ([6c214a5](https://github.com/coast-team/mute/commit/6c214a5))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/coast-team/mute/compare/v0.8.0...v0.8.1) (2018-07-17)


### Bug Fixes

* **bot:** check botStorage property in environment variable first ([4f571e3](https://github.com/coast-team/mute/commit/4f571e3))
* **release:** pop the right version of the app ([0920293](https://github.com/coast-team/mute/commit/0920293))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/coast-team/mute/compare/v0.7.1...v0.8.0) (2018-07-17)


### Bug Fixes

* **botstorage:** separate http and ws URLs ([e324222](https://github.com/coast-team/mute/commit/e324222))
* **cursor:** display name was not showing while typing ([cacbf9e](https://github.com/coast-team/mute/commit/cacbf9e))
* **cursor:** display name was not showing while typing ([1f4bb1a](https://github.com/coast-team/mute/commit/1f4bb1a))
* **decode:** catch possible error throwed by protobufjs decode function ([5589887](https://github.com/coast-team/mute/commit/5589887))
* **doc:** disable autofocus on right sidenav ([c55481a](https://github.com/coast-team/mute/commit/c55481a))
* **doc:** document content not read properly from db ([43b3a3a](https://github.com/coast-team/mute/commit/43b3a3a))
* **doc:** update title modification date when remote arrives ([40975b3](https://github.com/coast-team/mute/commit/40975b3))
* **docs:** did not update table headers and sidenav mode on mobile ([07de2f7](https://github.com/coast-team/mute/commit/07de2f7))
* **events:** fix observables unsubscriptions ([7553476](https://github.com/coast-team/mute/commit/7553476))
* **localstorage:** make previous doc version be compatibale with new ([a5708c3](https://github.com/coast-team/mute/commit/a5708c3))
* **logs:** use properly LogsService ([9e9ee79](https://github.com/coast-team/mute/commit/9e9ee79))
* **metadata:** put encryption key to metadata instead of URL ([4dd6f6e](https://github.com/coast-team/mute/commit/4dd6f6e))
* **metadata:** subscribed twice to the metadata changes ([30684ad](https://github.com/coast-team/mute/commit/30684ad))
* **settings:** failed open settings dialog ([b45a43a](https://github.com/coast-team/mute/commit/b45a43a))
* **settings:** select displayName on focus ([b478296](https://github.com/coast-team/mute/commit/b478296))
* **trash:** disallow to open a document in trash folder ([1c4911b](https://github.com/coast-team/mute/commit/1c4911b))
* **ui:** docs table: name and key columns ([318727f](https://github.com/coast-team/mute/commit/318727f))
* **ui:** one peer left involves others to disappear ([266261c](https://github.com/coast-team/mute/commit/266261c))
* prevented from mouse selection ([e58e384](https://github.com/coast-team/mute/commit/e58e384))
* **ui:** profile card show/hide animation ([761df95](https://github.com/coast-team/mute/commit/761df95))
* **ui:** small issues with collaborators list update ([5045fc4](https://github.com/coast-team/mute/commit/5045fc4))
* **ui-right-side:** profile card is updated now on signin or signout ([ddc1ced](https://github.com/coast-team/mute/commit/ddc1ced))


### Features

* **Doc:** add titleLastModification property in Doc ([6b1ccf0](https://github.com/coast-team/mute/commit/6b1ccf0))
* **metadata:** add changes for doc's fix metadata ([b62cf95](https://github.com/coast-team/mute/commit/b62cf95))
* **metadata:** wait for synchronisation of the encryption key ([ae9c269](https://github.com/coast-team/mute/commit/ae9c269))
* **signaling_key:** the signaling key is now an UUID ([b99ae68](https://github.com/coast-team/mute/commit/b99ae68))
* **title:** replicate the document's title for all collaborators ([2639341](https://github.com/coast-team/mute/commit/2639341))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/coast-team/mute/compare/v0.7.0...v0.7.1) (2018-06-15)


### Bug Fixes

* **release:** correctly make release commit and write changelog ([085bd7d](https://github.com/coast-team/mute/commit/085bd7d))



<a name="0.7.0"></a>

# [0.7.0](https://github.com/coast-team/mute/compare/v0.5.1...v0.7.0) (2018-06-15)

### Features

- **install:** application maybe added to the home screen ([844337b](https://github.com/coast-team/mute/commit/844337b))

<a name="0.6.0"></a>

# [0.6.0](https://github.com/coast-team/mute/compare/v0.5.1...v0.6.0) (2018-06-15)

### Bug Fixes

- **account:** add anonymous account icon to service worker resources ([1e25315](https://github.com/coast-team/mute/commit/1e25315))
- **appupdate:** better application update notification ([7e3cc62](https://github.com/coast-team/mute/commit/7e3cc62))
- **cheatsheet:** use material fonts and colors ([8e3925d](https://github.com/coast-team/mute/commit/8e3925d))
- **collaborators:** join/leave animation ([a97bf2a](https://github.com/coast-team/mute/commit/a97bf2a))
- **localOperation:** Logs now subscribe first, in order to read clock and state before the operation ([6a5cbbe](https://github.com/coast-team/mute/commit/6a5cbbe))
- **logs:** change siteId for peers and collaborators events and fixing duplicate subscription ([3eb4e9d](https://github.com/coast-team/mute/commit/3eb4e9d))
- **logs:** context is convert to object before being stored ([1af2392](https://github.com/coast-team/mute/commit/1af2392))
- **profile:** card not hiding when clicking elsewhere ([16c2a42](https://github.com/coast-team/mute/commit/16c2a42))
- **profile:** remove general. which causes compilation errors ([db11436](https://github.com/coast-team/mute/commit/db11436))
- **ui:** collaborator's details card on hovering ([c5b12ad](https://github.com/coast-team/mute/commit/c5b12ad))

### Features

- **logs:** Add a button in order to export muteLogs ([6b484c1](https://github.com/coast-team/mute/commit/6b484c1))
- **logs:** add collaboratorJoin and collaboratorLeave logs ([cd16c53](https://github.com/coast-team/mute/commit/cd16c53))
- **logs:** add connection and deconnection logs ([a3ea5a5](https://github.com/coast-team/mute/commit/a3ea5a5))
- **logs:** Add Database abstract class and IndexdbDatabase ([129859f](https://github.com/coast-team/mute/commit/129859f))
- **logs:** Add logs for local operations ([336a68e](https://github.com/coast-team/mute/commit/336a68e))
- **logs:** add LogsService and retrieve EditorComponent in DocComponent ([dbfa6c8](https://github.com/coast-team/mute/commit/dbfa6c8))
- **logs:** add peerConnection and peerDeconnection logs ([0a4f6cb](https://github.com/coast-team/mute/commit/0a4f6cb))
- **logs:** add property displayLogs in settings ([281870d](https://github.com/coast-team/mute/commit/281870d))
- **logs:** Change how we observe local and remote operations ([86fa3ba](https://github.com/coast-team/mute/commit/86fa3ba))
- **logs:** Use log with the new database system (indexdb for the moment) ([93df675](https://github.com/coast-team/mute/commit/93df675))
- **ui:** hovering a collaborator's chip shows details about them ([67c03be](https://github.com/coast-team/mute/commit/67c03be)), closes [#102](https://github.com/coast-team/mute/issues/102)

<a name="0.5.1"></a>

## [0.5.1](https://github.com/coast-team/mute/compare/v0.5.0...v0.5.1) (2018-06-01)

### Bug Fixes

- **docs:** add missing doc property in open document ([05b97b7](https://github.com/coast-team/mute/commit/05b97b7))

<a name="0.5.0"></a>

# [0.5.0](https://github.com/coast-team/mute/compare/v0.4.0...v0.5.0) (2018-06-01)

### Bug Fixes

- **bot:** doesn't throw error on displayName update when no bot ([b54c8a8](https://github.com/coast-team/mute/commit/b54c8a8))
- **collaborators:** update displayName not refreshed ([a3a53a4](https://github.com/coast-team/mute/commit/a3a53a4))
- **cursor:** calculateCursorProperties no longer throws undefined error ([d687a6c](https://github.com/coast-team/mute/commit/d687a6c))
- **cursor:** doesn't send cursor position on app load ([6e2f5d6](https://github.com/coast-team/mute/commit/6e2f5d6))
- **doc:** editor layout is now supported by a wide range of viewports ([808767f](https://github.com/coast-team/mute/commit/808767f))
- **doc:** succeed to create a new doc when another is open ([9778aba](https://github.com/coast-team/mute/commit/9778aba))
- **docs:** new doc button didn't work when no documents ([079c089](https://github.com/coast-team/mute/commit/079c089))
- **docs:** profile icon position ([0faf353](https://github.com/coast-team/mute/commit/0faf353))
- **serviceworker:** fetch all app files on new version available ([134e219](https://github.com/coast-team/mute/commit/134e219))

### Features

- **cursor:** show collaborator name on remote operation arrival ([701f0c0](https://github.com/coast-team/mute/commit/701f0c0))
- **encryption:** add env variable to enable/disable encryption ([2d588db](https://github.com/coast-team/mute/commit/2d588db))
- **nav:** show app version ([24a57ae](https://github.com/coast-team/mute/commit/24a57ae))
- **newdoc:** show Join option only in standalone mode ([d5c8ab0](https://github.com/coast-team/mute/commit/d5c8ab0))
- **ui-right-panel:** rework of the collaborator chip ([b9381d1](https://github.com/coast-team/mute/commit/b9381d1))

<a name="0.4.1"></a>

## [0.4.1](https://github.com/coast-team/mute/compare/v0.4.0...v0.4.1) (2018-05-25)

### Bug Fixes

- **cursor:** doesn't send cursor position on app load ([6e2f5d6](https://github.com/coast-team/mute/commit/6e2f5d6))
