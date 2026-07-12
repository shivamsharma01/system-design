import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

/**
 * Prefixes relative `/api/...` calls with a configured base URL when set.
 * Inert today — the app is fully static (`apiBaseUrl` is empty).
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  if (req.url.startsWith('/api') && config.apiBaseUrl) {
    return next(req.clone({ url: `${config.apiBaseUrl}${req.url}` }));
  }
  return next(req);
};
