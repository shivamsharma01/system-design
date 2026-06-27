import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CalloutVariant } from '../../models';
import { IconComponent, IconName } from '../icon/icon.component';
import { MarkdownComponent } from '../markdown/markdown.component';

const VARIANT_ICON: Record<CalloutVariant, IconName> = {
  note: 'note',
  info: 'info',
  tip: 'tip',
  warning: 'warning',
  danger: 'danger',
  summary: 'summary',
};

const VARIANT_LABEL: Record<CalloutVariant, string> = {
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
  summary: 'Summary',
};

/**
 * Admonition box used for notes, info, tips, warnings, danger, and summaries.
 * Covers the spec's Warning Box / Information Box / Summary Box / Notes.
 */
@Component({
  selector: 'app-callout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MarkdownComponent],
  template: `
    <aside class="callout" [class]="'callout--' + variant()" role="note">
      <div class="callout__icon">
        <app-icon [name]="icon()" [size]="18" />
      </div>
      <div class="callout__content">
        <p class="callout__title">{{ title() || label() }}</p>
        <app-markdown class="callout__body" [value]="body()" />
      </div>
    </aside>
  `,
  styleUrl: './callout.component.scss',
})
export class CalloutComponent {
  readonly variant = input<CalloutVariant>('note');
  readonly title = input<string>();
  readonly body = input.required<string>();

  protected readonly icon = computed<IconName>(() => VARIANT_ICON[this.variant()]);
  protected readonly label = computed(() => VARIANT_LABEL[this.variant()]);
}
