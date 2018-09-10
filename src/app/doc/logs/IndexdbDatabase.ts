import { Database } from './Database'

export class IndexdbDatabase extends Database {
  private db: any

  static destroy(name) {
    const deleteRequest = window.indexedDB.deleteDatabase('jio:' + name)
    deleteRequest.onerror = (event) => {
      console.error('An error as occured while deleting the indexedDB : ' + name)
    }
  }

  public init(name: string): void {
    this.db = jIO.createJIO({
      type: 'uuid',
      sub_storage: {
        type: 'indexeddb',
        database: `${name}`,
      },
    })
  }

  public store(obj: object): void {
    this.db.post(obj)
  }

  public get(): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.db.allDocs({ include_docs: true }).then(
        ({ data }: any) => {
          resolve(data.rows.reduce((a, e) => new Array(...a, e.doc), []).sort((a, b) => a.timestamp - b.timestamp))
        },
        (err) => {
          reject(err)
        }
      )
    })
  }
}
