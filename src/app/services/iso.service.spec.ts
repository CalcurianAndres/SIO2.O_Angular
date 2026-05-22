import { TestBed } from '@angular/core/testing';

import { IsoService } from './iso.service';

describe('IsoService', () => {
  let service: IsoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
