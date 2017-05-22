import { Folder } from '../Folder'
import { File } from '../File'

export interface StorageServiceInterface {
  fetchFiles (folder: Folder): Promise<File[]>

  deleteFiles (folder: Folder): Promise<any>
}
