import { Folder } from '../../Folder'
import { BotInfo } from './BotInfo'
import { BotStorageService } from './bot-storage.service'

export class FolderBot extends Folder {
  public bot: BotInfo

  constructor (
    bot: BotInfo,
    icon: string,
    service: BotStorageService
  ) {
    super(bot.id, `Bot Storage: ${bot.title}`, icon, service)
    this.bot = bot
  }

}
