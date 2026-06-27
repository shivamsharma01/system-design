import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  InMemoryScrollingFeature,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { ContentSource, StaticContentSource } from './core/services/content-source';
import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const scrolling: InMemoryScrollingFeature = withInMemoryScrolling({
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled',
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, scrolling, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, errorInterceptor])),
    // Swap StaticContentSource for an ApiContentSource to use the backend.
    { provide: ContentSource, useClass: StaticContentSource },
  ],
};
