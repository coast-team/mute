import { AbstractStorageService } from './AbstractStorageService'

export class File {
  constructor (
    readonly id: string,
    readonly title: string,
    readonly icon: string,
    readonly isDoc: boolean,
    private storage: AbstractStorageService
  ) { }

  delete (name: string) {
    this.storage.delete(this, name)
  }

  deleteAll () {
    this.storage.deleteAll(this)
  }

  getDocument (name: string) {
    return this.storage.getDocument(this, name)
  }

  addDocument (name: string, doc: any) {
    this.storage.addDocument(this, name, doc)
  }

  getDocuments () {
    return this.storage.getDocuments(this)
  }

}
