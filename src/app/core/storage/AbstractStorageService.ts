import { Folder } from 'core/storage/Folder'

export abstract class AbstractStorageService {

  abstract delete (folder: Folder, name: string): Promise<void>
  abstract deleteAll (folder: Folder): Promise<void>
  abstract getDocuments (folder: Folder): Promise<any>
  abstract getDocument (folder: Folder, name: string)
  abstract addDocument (folder: Folder, name: string, doc: any)
}
