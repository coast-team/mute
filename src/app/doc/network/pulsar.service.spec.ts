import { HttpClientTestingModule } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { PulsarService } from './pulsar.service'

describe('PulsarService', () => {
  let pulsarService: PulsarService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        PulsarService
      ]
    })
    pulsarService = TestBed.inject(PulsarService)
  })

  it('Correct Init', () => {
    expect(pulsarService).toBeTruthy('pulsarService has not been initialized')
  })
})
