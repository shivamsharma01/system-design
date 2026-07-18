import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
    <div class="interview" [class.interview--sketch]="isSketch()">
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
  styleUrl: './interview-tips.component.scss',
})
export class InterviewTipsComponent {
  readonly title = input<string>();
  readonly items = input.required<QaItem[]>();
  readonly variant = input<'default' | 'sketch'>('default');

  protected readonly isSketch = computed(() => this.variant() === 'sketch');
}
