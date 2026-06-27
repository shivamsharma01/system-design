import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  it('toggles between light and dark', () => {
    const service = TestBed.inject(ThemeService);
    const initial = service.theme();
    service.toggle();
    expect(service.theme()).not.toBe(initial);
  });

  it('reflects isDark for the dark theme', () => {
    const service = TestBed.inject(ThemeService);
    service.set('dark');
    expect(service.isDark()).toBe(true);
    service.set('light');
    expect(service.isDark()).toBe(false);
  });

  it('persists the chosen theme to the DOM', () => {
    const service = TestBed.inject(ThemeService);
    service.set('dark');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
