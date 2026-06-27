import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { designExistsGuard } from './design-exists.guard';

function runGuard(slug: string | null) {
  const route = {
    paramMap: { get: () => slug },
  } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => designExistsGuard(route, state));
}

describe('designExistsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('allows navigation to a known design', () => {
    expect(runGuard('netflix')).toBe(true);
  });

  it('redirects unknown slugs to /not-found', () => {
    const result = runGuard('does-not-exist');
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toContain('not-found');
  });

  it('redirects when no slug is present', () => {
    expect(runGuard(null) instanceof UrlTree).toBe(true);
  });

  it('has a working router for redirects', () => {
    expect(TestBed.inject(Router)).toBeTruthy();
  });
});
