import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Central HTTP error logging hook. Currently just logs and rethrows; future
 * features can surface toasts or route to an error page here.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error.message);
      return throwError(() => error);
    }),
  );
};
