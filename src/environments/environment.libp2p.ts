import { IEnvironment } from './IEnvironment.model'
import { defaultEnvironment } from './default'
import { networkSolution } from '@app/doc/network/solutions/networkSolution'

const host = 'mute.loria.fr' // FIXME: interpolation at build time required

export const environment: IEnvironment = {
  ...defaultEnvironment, // we extend the default environment

  network: networkSolution.LIBP2P,
  
  p2p: {
    rtcConfiguration: defaultEnvironment.p2p.rtcConfiguration,
    signalingServer: `/dns4/${host}/tcp/8012/wss/p2p-webrtc-star/`,
    signalingServerTestAddr: `https://${host}:8012`,
  }
}