import { IEnvironment } from './IEnvironment.model'
import { environment as prodEnvironment } from './environment.prod'

const host = 'mute.loria.fr' // FIXME: interpolation at build time required

export const environment: IEnvironment = {
  ...prodEnvironment, // we extend the default environment

  pulsar: {
    wsURL: `wss://${host}:8080/ws/v2`
  }
}