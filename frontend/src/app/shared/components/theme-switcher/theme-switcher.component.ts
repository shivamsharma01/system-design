import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

/** Button that toggles between light and dark themes. */
@Component({
  selector: 'app-theme-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="theme-switcher"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
      [title]="theme.isDark() ? 'Light mode' : 'Dark mode'"
    >
      <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" />
    </button>
  `,
  styles: [
    `
      .theme-switcher {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text-muted);
        cursor: pointer;
        transition:
          color var(--transition-fast),
          border-color var(--transition-fast);
      }
      .theme-switcher:hover {
        color: var(--color-text);
        border-color: var(--color-border-strong);
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  protected readonly theme = inject(ThemeService);
}
