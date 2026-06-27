import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TimelineItem } from '../../models';

/** Vertical timeline, e.g. for request lifecycle or rollout phases. */
@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="timeline">
      @for (item of items(); track $index) {
        <li class="timeline__item">
          <div class="timeline__marker">{{ $index + 1 }}</div>
          <div class="timeline__content">
            <p class="timeline__title">
              {{ item.title }}
              @if (item.meta) {
                <span class="timeline__meta">{{ item.meta }}</span>
              }
            </p>
            <p class="timeline__desc">{{ item.description }}</p>
          </div>
        </li>
      }
    </ol>
  `,
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  readonly items = input.required<TimelineItem[]>();
}
