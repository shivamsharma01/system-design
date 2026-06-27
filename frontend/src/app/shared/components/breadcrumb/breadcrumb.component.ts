import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

export interface Crumb {
  label: string;
  link?: string;
}

/** Breadcrumb trail. The last crumb is rendered as the current (non-link) page. */
@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        @for (crumb of crumbs(); track crumb.label; let last = $last) {
          <li>
            @if (crumb.link && !last) {
              <a [routerLink]="crumb.link">{{ crumb.label }}</a>
            } @else {
              <span aria-current="page">{{ crumb.label }}</span>
            }
            @if (!last) {
              <app-icon name="chevron-right" [size]="14" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      .breadcrumb ol {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-1);
        margin: 0;
        padding: 0;
        font-size: var(--text-sm);
        color: var(--color-text-subtle);
      }
      .breadcrumb li {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
      }
      .breadcrumb span[aria-current] {
        color: var(--color-text);
        font-weight: 500;
      }
    `,
  ],
})
export class BreadcrumbComponent {
  readonly crumbs = input.required<Crumb[]>();
}
