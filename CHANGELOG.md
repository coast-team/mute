# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.6.0"></a>
# [0.6.0](https://github.com/coast-team/mute/compare/v0.5.1...v0.6.0) (2018-06-15)


### Bug Fixes

* **account:** add anonymous account icon to service worker resources ([1e25315](https://github.com/coast-team/mute/commit/1e25315))
* **appupdate:** better application update notification ([7e3cc62](https://github.com/coast-team/mute/commit/7e3cc62))
* **cheatsheet:** use material fonts and colors ([8e3925d](https://github.com/coast-team/mute/commit/8e3925d))
* **collaborators:** join/leave animation ([a97bf2a](https://github.com/coast-team/mute/commit/a97bf2a))
* **localOperation:** Logs now subscribe first, in order to read clock and state before the operation ([6a5cbbe](https://github.com/coast-team/mute/commit/6a5cbbe))
* **logs:** change siteId for peers and collaborators events and fixing duplicate subscription ([3eb4e9d](https://github.com/coast-team/mute/commit/3eb4e9d))
* **logs:** context is convert to object before being stored ([1af2392](https://github.com/coast-team/mute/commit/1af2392))
* **profile:** card not hiding when clicking elsewhere ([16c2a42](https://github.com/coast-team/mute/commit/16c2a42))
* **profile:** remove general. which causes compilation errors ([db11436](https://github.com/coast-team/mute/commit/db11436))
* **ui:** collaborator's details card on hovering ([c5b12ad](https://github.com/coast-team/mute/commit/c5b12ad))


### Features

* **logs:** Add a button in order to export muteLogs ([6b484c1](https://github.com/coast-team/mute/commit/6b484c1))
* **logs:** add collaboratorJoin and collaboratorLeave logs ([cd16c53](https://github.com/coast-team/mute/commit/cd16c53))
* **logs:** add connection and deconnection logs ([a3ea5a5](https://github.com/coast-team/mute/commit/a3ea5a5))
* **logs:** Add Database abstract class and IndexdbDatabase ([129859f](https://github.com/coast-team/mute/commit/129859f))
* **logs:** Add logs for local operations ([336a68e](https://github.com/coast-team/mute/commit/336a68e))
* **logs:** add LogsService and retrieve EditorComponent in DocComponent ([dbfa6c8](https://github.com/coast-team/mute/commit/dbfa6c8))
* **logs:** add peerConnection and peerDeconnection logs ([0a4f6cb](https://github.com/coast-team/mute/commit/0a4f6cb))
* **logs:** add property displayLogs in settings ([281870d](https://github.com/coast-team/mute/commit/281870d))
* **logs:** Change how we observe local and remote operations ([86fa3ba](https://github.com/coast-team/mute/commit/86fa3ba))
* **logs:** Use log with the new database system (indexdb for the moment) ([93df675](https://github.com/coast-team/mute/commit/93df675))
* **ui:** hovering a collaborator's chip shows details about them ([67c03be](https://github.com/coast-team/mute/commit/67c03be)), closes [#102](https://github.com/coast-team/mute/issues/102)



<a name="0.5.1"></a>
## [0.5.1](https://github.com/coast-team/mute/compare/v0.5.0...v0.5.1) (2018-06-01)


### Bug Fixes

* **docs:** add missing doc property in open document ([05b97b7](https://github.com/coast-team/mute/commit/05b97b7))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/coast-team/mute/compare/v0.4.0...v0.5.0) (2018-06-01)


### Bug Fixes

* **bot:** doesn't throw error on displayName update when no bot ([b54c8a8](https://github.com/coast-team/mute/commit/b54c8a8))
* **collaborators:** update displayName not refreshed ([a3a53a4](https://github.com/coast-team/mute/commit/a3a53a4))
* **cursor:** calculateCursorProperties no longer throws undefined error ([d687a6c](https://github.com/coast-team/mute/commit/d687a6c))
* **cursor:** doesn't send cursor position on app load ([6e2f5d6](https://github.com/coast-team/mute/commit/6e2f5d6))
* **doc:** editor layout is now supported by a wide range of viewports ([808767f](https://github.com/coast-team/mute/commit/808767f))
* **doc:** succeed to create a new doc when another is open ([9778aba](https://github.com/coast-team/mute/commit/9778aba))
* **docs:** new doc button didn't work when no documents ([079c089](https://github.com/coast-team/mute/commit/079c089))
* **docs:** profile icon position ([0faf353](https://github.com/coast-team/mute/commit/0faf353))
* **serviceworker:** fetch all app files on new version available ([134e219](https://github.com/coast-team/mute/commit/134e219))


### Features

* **cursor:** show collaborator name on remote operation arrival ([701f0c0](https://github.com/coast-team/mute/commit/701f0c0))
* **encryption:** add env variable to enable/disable encryption ([2d588db](https://github.com/coast-team/mute/commit/2d588db))
* **nav:** show app version ([24a57ae](https://github.com/coast-team/mute/commit/24a57ae))
* **newdoc:** show Join option only in standalone mode ([d5c8ab0](https://github.com/coast-team/mute/commit/d5c8ab0))
* **ui-right-panel:** rework of the collaborator chip ([b9381d1](https://github.com/coast-team/mute/commit/b9381d1))



<a name="0.4.1"></a>

## [0.4.1](https://github.com/coast-team/mute/compare/v0.4.0...v0.4.1) (2018-05-25)

### Bug Fixes

- **cursor:** doesn't send cursor position on app load ([6e2f5d6](https://github.com/coast-team/mute/commit/6e2f5d6))
