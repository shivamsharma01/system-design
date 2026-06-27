import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DesignMeta } from '../../models';
import { DifficultyBadgeComponent } from '../difficulty-badge/difficulty-badge.component';
import { ReadingTimeComponent } from '../reading-time/reading-time.component';

/** Catalog card linking to a design page. Used on the home grid. */
@Component({
  selector: 'app-design-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DifficultyBadgeComponent, ReadingTimeComponent],
  template: `
    <a class="card" [routerLink]="['/designs', meta().slug]">
      <div class="card__top" [style.background]="meta().heroGradient || defaultGradient">
        <span class="card__icon">{{ meta().icon || '#' }}</span>
        @if (meta().status === 'draft') {
          <span class="card__draft">Draft</span>
        }
      </div>
      <div class="card__body">
        <p class="card__category">{{ meta().category }}</p>
        <h3 class="card__title">{{ meta().title }}</h3>
        <p class="card__tagline">{{ meta().tagline }}</p>
      </div>
      <div class="card__footer">
        <app-difficulty-badge [difficulty]="meta().difficulty" />
        <app-reading-time [minutes]="meta().readingTimeMin" />
      </div>
    </a>
  `,
  styleUrl: './design-card.component.scss',
})
export class DesignCardComponent {
  readonly meta = input.required<DesignMeta>();
  protected readonly defaultGradient = 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)';
}
