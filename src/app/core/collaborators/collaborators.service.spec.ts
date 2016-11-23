/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CollaboratorsService } from './collaborators.service';

describe('CollaboratorsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CollaboratorsService]
    });
  });

  it('should ...', inject([CollaboratorsService], (service: CollaboratorsService) => {
    expect(service).toBeTruthy();
  }));
});
