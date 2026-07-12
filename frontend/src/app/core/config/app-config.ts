import { InjectionToken } from '@angular/core';

export interface AppConfig {
  /** Optional API base URL for future remote content. Empty = fully static. */
  apiBaseUrl: string;
  githubRepoUrl: string;
  siteName: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: '',
  githubRepoUrl: 'https://github.com/your-org/system-design',
  siteName: 'SystemDesign.dev',
};

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_APP_CONFIG,
});
