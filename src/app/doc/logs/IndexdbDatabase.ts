import { Database } from './Database'

export class IndexdbDatabase extends Database {

  private db: any

  public init (name: string): void {
    console.log('Init')
    this.db = jIO.createJIO({
      type: 'uuid',
      sub_storage: {
        type: 'indexeddb',
        database: `${name}`
      }
    })
  }

  public store (obj: object): void {
    this.db.post(obj)
  }

  public get (): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.db.allDocs({ include_docs: true })
        .then(({ data }: any) => {
          resolve(data.rows.reduce((a, e) => new Array(...a, e.doc), []).sort((a, b) => a.timestamp - b.timestamp))
        },
          (err) => { reject(err) })
    })
  }

}
