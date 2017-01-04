/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { StorageService } from './storage.service'

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    })
  })

  it('should ...', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy()
  }))
});
