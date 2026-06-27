import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DesignRegistryService } from '../services/design-registry.service';

/**
 * Blocks navigation to `/designs/:slug` for unknown slugs and redirects to the
 * not-found page, so deep links to non-existent designs degrade gracefully.
 */
export const designExistsGuard: CanActivateFn = (route) => {
  const registry = inject(DesignRegistryService);
  const router = inject(Router);
  const slug = route.paramMap.get('slug');

  if (slug && registry.has(slug)) {
    return true;
  }
  return router.createUrlTree(['/not-found']);
};
