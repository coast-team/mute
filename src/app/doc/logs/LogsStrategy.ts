import { RabbitMq } from './RabbitMq'

export interface ILogsStrategy {
  sendLogs (obj: object, share: boolean): void
}
