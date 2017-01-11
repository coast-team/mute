/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { BotStorageService } from './bot-storage.service'

describe('BotStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BotStorageService]
    })
  })

  it('should ...', inject([BotStorageService], (service: BotStorageService) => {
    expect(service).toBeTruthy()
  }))
})
