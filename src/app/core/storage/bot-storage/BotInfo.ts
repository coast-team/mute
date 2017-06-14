import { FolderBot } from './FolderBot'

export class BotInfo {
  private route: string

  public title: string
  public apiURL: string
  public p2pURL: string

  constructor (title, apiURL, p2pURL) {
    this.title = title
    this.apiURL = apiURL
    this.p2pURL = p2pURL
    this.route = 'bs-' + encodeURI(title.toLowerCase())
  }

  get id () { return this.route }
}
