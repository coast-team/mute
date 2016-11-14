/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { DocService } from './doc.service'

describe('Service: Doc', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocService]
    })
  })

  it('should ...', inject([DocService], (service: DocService) => {
    expect(service).toBeTruthy()
  }))
})
