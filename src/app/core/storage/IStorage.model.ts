import { StateTypes } from '@coast-team/mute-core'

import { Doc } from '../Doc'
import { File } from '../File'
import { Folder } from '../Folder'

export interface IStorage {
  save(file: File): void
  move(file: File, folder: Folder): void
  delete(file: File): void
  saveDocContent(doc: Doc, body: StateTypes)
  fetchDocContent(doc: Doc): Promise<StateTypes | undefined>
  fetchDocContent(doc: Doc, blob: boolean): Promise<StateTypes | Blob | undefined>
  fetchDocs(folder: Folder): Promise<Doc[]>
}
