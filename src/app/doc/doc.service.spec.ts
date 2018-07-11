import { inject, TestBed } from '@angular/core/testing'

import { DocService } from './doc.service'

describe('DocService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocService],
    })
  })

  it('should be created', inject([DocService], (service: DocService) => {
    expect(service).toBeTruthy()
  }))
})
