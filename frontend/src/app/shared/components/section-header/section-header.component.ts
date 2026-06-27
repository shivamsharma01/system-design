import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Heading for a content section, with a hoverable anchor link to its id. */
@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <header class="section-header">
      <h2 class="section-header__title">
        {{ title() }}
        @if (anchor(); as id) {
          <a class="section-header__anchor" [href]="'#' + id" aria-label="Link to section">
            <app-icon name="link" [size]="16" />
          </a>
        }
      </h2>
      @if (subtitle()) {
        <p class="section-header__subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: [
    `
      .section-header {
        margin: var(--space-10) 0 var(--space-4);
      }
      .section-header__title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-2xl);
        margin: 0;
      }
      .section-header__anchor {
        opacity: 0;
        color: var(--color-text-subtle);
        transition: opacity var(--transition-fast);
      }
      .section-header__title:hover .section-header__anchor {
        opacity: 1;
      }
      .section-header__subtitle {
        margin: var(--space-2) 0 0;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly anchor = input<string>();
}
