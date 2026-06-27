import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MetricItem } from '../../models';

/** Grid of headline metrics (e.g. capacity estimation figures). */
@Component({
  selector: 'app-metric-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metrics">
      @for (item of items(); track item.label) {
        <div class="metric">
          <p class="metric__value">{{ item.value }}</p>
          <p class="metric__label">{{ item.label }}</p>
          @if (item.hint) {
            <p class="metric__hint">{{ item.hint }}</p>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './metric-card.component.scss',
})
export class MetricCardComponent {
  readonly items = input.required<MetricItem[]>();
}
