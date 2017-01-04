/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { LocalStorageService } from './local-storage.service'

describe('LocalStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoragLocalStorageServiceeService]
    })
  })

  it('should ...', inject([LocalStorageService], (service: LocalStorageService) => {
    expect(service).toBeTruthy()
  }))
})
