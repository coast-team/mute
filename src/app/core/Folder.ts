import { StorageServiceInterface } from './storage/StorageServiceInterface'
import { File } from './File'

export class Folder extends File {
  private service: StorageServiceInterface

  public route: string
  public icon: string

  constructor (
    route: string,
    title: string,
    icon: string,
    service: StorageServiceInterface
  ) {
    super(title)
    this.route = route
    this.icon = icon
    this.service = service
  }

  get id (): string { return this.route }

  fetchFiles (): Promise<File[]> {
    return this.service.fetchFiles(this)
  }

  deleteFiles (): Promise<any>  {
    return this.service.deleteFiles(this)
  }
}
