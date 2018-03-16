import { Observable } from 'rxjs/Observable'

import { Doc } from '../Doc'
import { Folder } from '../Folder'

export interface IStorage {
  status: any
  onStatusChange: Observable<any>
  getDocs: (folder: Folder) => Promise<Doc[]>
}
