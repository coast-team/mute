export class BotStorage {

  public name: string
  private secure: boolean
  private host: string
  private port: number

  constructor (name: string, secure: boolean, host: string, port: number) {
    this.name = name
    this.secure = secure
    this.host = host
    this.port = port
  }

  get httpURL () {
    const protocol =  this.secure ? 'https' : 'http'
    if (this.secure && this.port === 443) {
      return `${protocol}://${this.host}`
    } else {
      return `${protocol}://${this.host}:${this.port}`
    }
  }

  get wsURL () {
    const protocol =  this.secure ? 'wss' : 'ws'
    return `${protocol}://${this.host}:${this.port}`
  }

  get id () {
    return `${this.name}@${this.host}`
  }
}
