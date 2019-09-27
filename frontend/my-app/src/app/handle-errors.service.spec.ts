import { TestBed } from '@angular/core/testing';

import { HandleErrorsService } from './handle-errors.service';

describe('HandleErrorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HandleErrorsService = TestBed.get(HandleErrorsService);
    expect(service).toBeTruthy();
  });
});
