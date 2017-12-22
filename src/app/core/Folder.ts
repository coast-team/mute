import { File } from './File'

export class Folder extends File {
  public icon: string

  static deserialize (dbId: string, serialized: any): Folder {
    const folder =  new Folder(serialized.key, serialized.title, serialized.icon, serialized.location)
    File.deserialize(dbId, serialized, folder)
    return folder
  }

  constructor (routeName: string, title: string, icon: string, location?: string) {
    super(routeName, title, location)
    this.icon = icon
  }

  get route (): string {
    return this.location === undefined ? `/${this.key}` : `${this.location}/${this.key}`
  }

  get title () {
    return this._title
  }

  set title (newTitle: string) {
    this._title = newTitle
  }

  get isDoc () { return false }

  serialize (): object {
    return Object.assign(super.serialize(), {
      type: 'folder',
      route: this.route,
      icon: this.icon
    })
  }
}
