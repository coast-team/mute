import { File } from '../File'
import { Folder } from '../Folder'

export abstract class AbstractStorageService {

  deleteAll (folder: Folder): Promise<void> {
    return Promise.reject('Not authorized')
  }

  abstract getFiles (folder: Folder): Promise<File[]>
}
