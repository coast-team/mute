export abstract class File {
  private _location: string
  protected _title: string

  public dbId: string
  public key: string
  public previousLocation: string

  static deserialize (dbId: string, serialized: any, file: File) {
    file.dbId = dbId
    file.previousLocation = serialized.previousLocation
  }

  constructor (key: string, title: string, location: string) {
    this.key = key
    this._title = title
    this._location = location
  }

  get location (): string {
    return this._location
  }

  set location (location: string) {
    this.previousLocation = this.location
    this._location = location
  }

  abstract get isDoc (): boolean

  abstract get title ();

  abstract set title (newTitle: string);

  serialize (): object {
    return {
      key: this.key,
      title: this.title,
      location: this.location,
      previousLocation: this.previousLocation
    }
  }
}
