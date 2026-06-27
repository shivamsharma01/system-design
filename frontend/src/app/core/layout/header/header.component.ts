import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../config/app-config';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ThemeSwitcherComponent } from '../../../shared/components/theme-switcher/theme-switcher.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

/** Sticky top bar: logo, global search, theme toggle, GitHub link. */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SearchBarComponent, ThemeSwitcherComponent, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly config = inject(APP_CONFIG);

  /** Emitted when the mobile menu button is pressed. */
  readonly toggleSidebar = output<void>();
}
