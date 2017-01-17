/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { SyncMessageService } from './sync-message.service'

describe('Service: SyncMessage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SyncMessageService]
    })
  })

  it('should ...', inject([SyncMessageService], (service: SyncMessageService) => {
    expect(service).toBeTruthy()
  }))
})
