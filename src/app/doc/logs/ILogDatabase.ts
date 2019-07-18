import { environment } from '../../../environments/environment'

export interface ILogDatabase {
  send(data: object): void
}
