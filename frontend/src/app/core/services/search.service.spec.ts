import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('finds a design by title', () => {
    const service = TestBed.inject(SearchService);
    const results = service.search('netflix');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].meta.slug).toBe('netflix');
  });

  it('matches by technology / tag', () => {
    const service = TestBed.inject(SearchService);
    const results = service.search('cassandra');
    expect(results.some((r) => r.meta.slug === 'netflix')).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    const service = TestBed.inject(SearchService);
    expect(service.search('')).toEqual([]);
  });
});
