import { TestBed } from '@angular/core/testing';

import { DeadlineTimerService } from './deadline-timer.service';

describe('DeadlineTimerService', () => {
  let service: DeadlineTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeadlineTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
