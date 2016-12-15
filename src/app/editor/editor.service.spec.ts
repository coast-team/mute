/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing'
import { EditorService } from './editor.service'

describe('EditorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorService]
    })
  })

  it('should ...', inject([EditorService], (service: EditorService) => {
    expect(service).toBeTruthy()
  }))
})
