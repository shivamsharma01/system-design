import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DesignMeta } from '../../models';
import { DifficultyBadgeComponent } from '../difficulty-badge/difficulty-badge.component';
import { ReadingTimeComponent } from '../reading-time/reading-time.component';
import { TechnologyBadgeComponent } from '../technology-badge/technology-badge.component';

/** Large gradient banner at the top of a design page. */
@Component({
  selector: 'app-hero-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DifficultyBadgeComponent, ReadingTimeComponent, TechnologyBadgeComponent],
  template: `
    <header class="hero" [style.background]="meta().heroGradient || defaultGradient">
      <div class="hero__overlay">
        @if (meta().icon) {
          <div class="hero__icon">{{ meta().icon }}</div>
        }
        <p class="hero__category">{{ meta().category }}</p>
        <h1 class="hero__title">{{ meta().title }}</h1>
        <p class="hero__tagline">{{ meta().tagline }}</p>

        <div class="hero__meta">
          <app-difficulty-badge [difficulty]="meta().difficulty" />
          <app-reading-time [minutes]="meta().readingTimeMin" />
          @if (meta().status === 'draft') {
            <span class="hero__draft">Draft</span>
          }
        </div>

        @if (meta().technologies.length) {
          <div class="hero__tech">
            @for (tech of meta().technologies; track tech) {
              <app-technology-badge [label]="tech" />
            }
          </div>
        }
      </div>
    </header>
  `,
  styleUrl: './hero-banner.component.scss',
})
export class HeroBannerComponent {
  readonly meta = input.required<DesignMeta>();
  protected readonly defaultGradient = 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)';
}
