import { TestBed, inject } from '@angular/core/testing'

import { ConnectivityService } from './connectivity.service'

describe('ConnectivityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectivityService]
    })
  })

  it('should be created', inject([ConnectivityService], (service: ConnectivityService) => {
    expect(service).toBeTruthy()
  }))
})
