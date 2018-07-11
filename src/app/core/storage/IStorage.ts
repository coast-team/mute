import { State } from 'mute-core'
import { Doc } from '../Doc'
import { File } from '../File'
import { Folder } from '../Folder'

export interface IStorage {
  save(file: File): void
  move(file: File, folder: Folder): void
  delete(file: File): void
  saveDocContent(doc: Doc, body: State)
  fetchDocContent(doc: Doc): Promise<object>
  fetchDocs(folder: Folder): Promise<Doc[]>
}
