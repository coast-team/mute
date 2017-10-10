export class BotInfo {
  private route: string

  public title: string
  private secure: boolean
  private hostPort: string

  constructor (title: string, secure: boolean, hostPort: string) {
    this.title = title
    this.secure = secure
    this.hostPort = hostPort
    this.route = 'bs-' + encodeURI(title.toLowerCase())
  }

  get httpURL () {
    const protocol =  this.secure ? 'https' : 'http'
    return `${protocol}://${this.hostPort}`
  }

  get wsURL () {
    const protocol =  this.secure ? 'wss' : 'ws'
    return `${protocol}://${this.hostPort}`
  }

  get id () { return this.route }
}
