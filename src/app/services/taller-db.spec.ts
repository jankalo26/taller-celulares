import { TestBed } from '@angular/core/testing';
import { TallerDb } from './taller-db';

describe('TallerDb', () => {
  let service: TallerDb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TallerDb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
