import { File } from 'core/storage/File'

export abstract class AbstractStorageService {

  abstract delete (folder: File, name: string): Promise<void>
  abstract deleteAll (folder: File): Promise<void>
  abstract getDocuments (folder: File): Promise<any>
  abstract getDocument (folder: File, name: string)
  abstract addDocument (folder: File, name: string, doc: any)
}
