import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReferenceItem } from '../../models';
import { IconComponent } from '../icon/icon.component';

/** Numbered list of external references / further reading. */
@Component({
  selector: 'app-reference-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <ol class="refs">
      @for (ref of items(); track ref.url) {
        <li class="refs__item">
          <a [href]="ref.url" target="_blank" rel="noopener noreferrer">
            {{ ref.label }}
            <app-icon name="external-link" [size]="13" />
          </a>
          @if (ref.source) {
            <span class="refs__source">{{ ref.source }}</span>
          }
        </li>
      }
    </ol>
  `,
  styles: [
    `
      .refs {
        margin: var(--space-4) 0;
        padding-left: var(--space-6);
      }
      .refs__item {
        margin-bottom: var(--space-2);
        font-size: var(--text-sm);
      }
      .refs__item a {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .refs__source {
        margin-left: var(--space-2);
        color: var(--color-text-subtle);
        font-size: var(--text-xs);
      }
    `,
  ],
})
export class ReferenceListComponent {
  readonly items = input.required<ReferenceItem[]>();
}
