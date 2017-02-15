import { AbstractStorageService } from 'core/storage/AbstractStorageService'

export class Folder {
  constructor (
    readonly title: string,
    readonly link: string,
    readonly icon: string,
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
