import { TestBed } from '@angular/core/testing';

import { BobinasService } from './bobinas.service';

describe('BobinasService', () => {
  let service: BobinasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BobinasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
