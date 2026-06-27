import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ReadingTimePipe } from '../../pipes/reading-time.pipe';

/** Inline "N min read" indicator with a clock icon. */
@Component({
  selector: 'app-reading-time',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ReadingTimePipe],
  template: `<span class="rt">
    <app-icon name="clock" [size]="14" />{{ minutes() | readingTime }}
  </span>`,
  styles: [
    `
      .rt {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--text-sm);
        color: var(--color-text-subtle);
      }
    `,
  ],
})
export class ReadingTimeComponent {
  readonly minutes = input.required<number>();
}
