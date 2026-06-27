import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

/**
 * Prefixes relative `/api/...` calls with the configured backend base URL.
 * Inert today (the app is fully static); ready for when the backend is enabled.
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  if (req.url.startsWith('/api') && config.apiBaseUrl) {
    return next(req.clone({ url: `${config.apiBaseUrl}${req.url}` }));
  }
  return next(req);
};
