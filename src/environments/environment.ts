import { IEnvironment } from './IEnvironment.model'
import { defaultEnvironment } from './default'

const host = 'coedit.re'

export const environment: IEnvironment = {
  ...defaultEnvironment
}