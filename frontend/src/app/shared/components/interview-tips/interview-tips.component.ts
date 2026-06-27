import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QaItem } from '../../models';
import { ExpandablePanelComponent } from '../expandable-panel/expandable-panel.component';
import { MarkdownComponent } from '../markdown/markdown.component';
import { IconComponent } from '../icon/icon.component';

/** Accordion of interview questions with reveal-on-expand answers. */
@Component({
  selector: 'app-interview-tips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ExpandablePanelComponent, MarkdownComponent, IconComponent],
  template: `
    <div class="interview">
      <p class="interview__title">
        <app-icon name="book" [size]="18" />
        {{ title() || 'Interview Questions' }}
      </p>
      @for (item of items(); track $index) {
        <app-expandable-panel [title]="item.question">
          <app-markdown [value]="item.answer" />
        </app-expandable-panel>
      }
    </div>
  `,
  styles: [
    `
      .interview {
        margin: var(--space-6) 0;
      }
      .interview__title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-weight: 700;
        font-size: var(--text-lg);
        margin: 0 0 var(--space-3);
        color: var(--color-accent);
      }
    `,
  ],
})
export class InterviewTipsComponent {
  readonly title = input<string>();
  readonly items = input.required<QaItem[]>();
}
