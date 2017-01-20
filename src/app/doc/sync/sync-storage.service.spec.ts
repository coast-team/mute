/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { SyncStorageService } from './sync-storage.service'

describe('Service: SyncStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SyncStorageService]
    })
  })

  it('should ...', inject([SyncStorageService], (service: SyncStorageService) => {
    expect(service).toBeTruthy()
  }))
})
