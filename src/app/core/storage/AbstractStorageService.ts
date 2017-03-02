import { File } from '../File'
import { Folder } from '../Folder'

export abstract class AbstractStorageService {

  abstract delete (file: File): Promise<void>
  abstract deleteAll (folder: Folder): Promise<void>
  abstract getFiles (folder: Folder): Promise<File[]>
  abstract addFile (folder: Folder, file: File): Promise<void>
}
