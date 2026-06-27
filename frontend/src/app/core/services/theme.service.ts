import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sd-theme';

/**
 * Signal-based theme manager. The initial theme is applied by an inline script
 * in `index.html` (to avoid a flash of the wrong theme); this service keeps the
 * `<html data-theme>` attribute and `localStorage` in sync afterwards.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly _theme = signal<Theme>(this.readInitialTheme());

  /** The active theme as a readonly signal. */
  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    // Reflect theme changes to the DOM + storage whenever the signal updates.
    effect(() => {
      const theme = this._theme();
      const root = this.document.documentElement;
      root.setAttribute('data-theme', theme);
      try {
        this.window?.localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Storage may be unavailable (private mode); theme still works in-memory.
      }
    });
  }

  toggle(): void {
    this._theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  set(theme: Theme): void {
    this._theme.set(theme);
  }

  private get window(): (Window & typeof globalThis) | null {
    return this.document.defaultView;
  }

  private readInitialTheme(): Theme {
    const fromDom = this.document.documentElement.getAttribute('data-theme');
    if (fromDom === 'dark' || fromDom === 'light') {
      return fromDom;
    }
    const prefersDark = this.window?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    return prefersDark ? 'dark' : 'light';
  }
}
