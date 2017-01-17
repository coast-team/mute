/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { SyncService } from './sync.service'

describe('Service: Sync', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SyncService]
    })
  })

  it('should ...', inject([SyncService], (service: SyncService) => {
    expect(service).toBeTruthy()
  }))
})
