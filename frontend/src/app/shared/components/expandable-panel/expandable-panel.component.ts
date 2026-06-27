import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Native, accessible disclosure widget (`<details>`). Projects arbitrary
 * content, so it can wrap nested content blocks rendered by the renderer.
 */
@Component({
  selector: 'app-expandable-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <details class="expandable" [open]="open()">
      <summary class="expandable__summary">
        <app-icon name="chevron-right" [size]="16" class="expandable__chevron" />
        <span>{{ title() }}</span>
      </summary>
      <div class="expandable__content">
        <ng-content />
      </div>
    </details>
  `,
  styleUrl: './expandable-panel.component.scss',
})
export class ExpandablePanelComponent {
  readonly title = input.required<string>();
  readonly open = input(false);
}
