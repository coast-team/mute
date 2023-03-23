import { IEnvironment } from './IEnvironment.model'
import { environment as prodEnvironment } from './environment.prod'
import { networkSolution } from '@app/doc/network/solutions/networkSolution'

const host = 'mutehost.loria.fr' // FIXME: interpolation at build time required

export const environment: IEnvironment = {
  ...prodEnvironment, // we extend the production environment

  network: networkSolution.NETFLUX,

  p2p: {
    rtcConfiguration: prodEnvironment.p2p.rtcConfiguration,
    signalingServer: `wss://${host}:8010`,
  }
}