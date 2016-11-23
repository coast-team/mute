/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CursorService } from './cursor.service';

describe('CursorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CursorService]
    });
  });

  it('should ...', inject([CursorService], (service: CursorService) => {
    expect(service).toBeTruthy();
  }));
});
