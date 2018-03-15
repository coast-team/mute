import { Observable } from 'rxjs/Observable'

import { Doc } from '../Doc'
import { Folder } from '../Folder'

export interface IStorage {
  isAvailable: Observable<boolean>
  getDocs: (folder: Folder) => Doc[]
}
