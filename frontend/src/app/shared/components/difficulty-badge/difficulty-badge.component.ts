import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Difficulty } from '../../models';

const LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Colored pill indicating a design's difficulty level. */
@Component({
  selector: 'app-difficulty-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge--' + difficulty()">
    <span class="dot"></span>{{ label() }}
  </span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 2px 10px;
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: 600;
        background: var(--color-surface-sunken);
        color: var(--c);
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--c);
      }
      .badge--beginner {
        --c: var(--difficulty-beginner);
      }
      .badge--intermediate {
        --c: var(--difficulty-intermediate);
      }
      .badge--advanced {
        --c: var(--difficulty-advanced);
      }
    `,
  ],
})
export class DifficultyBadgeComponent {
  readonly difficulty = input.required<Difficulty>();
  protected readonly label = computed(() => LABELS[this.difficulty()]);
}
