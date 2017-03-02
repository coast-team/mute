/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { StorageOverviewService } from './storage-overview.service'

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageOverviewService]
    })
  })

  it('should ...', inject([StorageOverviewService], (service: StorageOverviewService) => {
    expect(service).toBeTruthy()
  }))
})
