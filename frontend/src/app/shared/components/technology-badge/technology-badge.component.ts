import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Small pill representing a technology used in a design (e.g. "Kafka"). */
@Component({
  selector: 'app-technology-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="tech">{{ label() }}</span>`,
  styles: [
    `
      .tech {
        display: inline-flex;
        align-items: center;
        padding: 3px 10px;
        border-radius: var(--radius-sm);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--color-text-muted);
        background: var(--color-surface-sunken);
        border: 1px solid var(--color-border);
      }
    `,
  ],
})
export class TechnologyBadgeComponent {
  readonly label = input.required<string>();
}
