import { IEnvironment } from './IEnvironment.model'
import { defaultEnvironment } from './default'
import { networkSolution } from '@app/doc/network/solutions/networkSolution'
import * as reviewEnvironementVariablesJSON from 'conf/gitlab-ci/reviewEnv.json'
const reviewEnvironementVariablesAsString = JSON.stringify(reviewEnvironementVariablesJSON)
const reviewEnvironmentVariables: reviewEnvironmentVariables = JSON.parse(reviewEnvironementVariablesAsString)
const signalingHost = `${reviewEnvironmentVariables.reviewBranch}-signaling.mute.loria.fr`
export const environment: IEnvironment = {
  ...defaultEnvironment, // we extend the default environment

  network: networkSolution.LIBP2P,

  p2p: {
    rtcConfiguration: defaultEnvironment.p2p.rtcConfiguration,
    signalingServer: `/dns4/${signalingHost}/tcp/443/wss/p2p-webrtc-star/`,
    signalingServerTestAddr: `https://${signalingHost}`,
  },
}

interface reviewEnvironmentVariables {
  reviewBranch: string
}
