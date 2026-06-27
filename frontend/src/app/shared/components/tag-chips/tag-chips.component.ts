import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Row of tag chips. Optionally clickable (emits the tag that was selected). */
@Component({
  selector: 'app-tag-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <ul class="chips" [class.clickable]="clickable()">
      @for (tag of tags(); track tag) {
        <li>
          @if (clickable()) {
            <button type="button" class="chip" (click)="tagClick.emit(tag)">
              <app-icon name="hash" [size]="12" />{{ tag }}
            </button>
          } @else {
            <span class="chip"><app-icon name="hash" [size]="12" />{{ tag }}</span>
          }
        </li>
      }
    </ul>
  `,
  styles: [
    `
      .chips {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin: 0;
        padding: 0;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--color-text-muted);
        background: var(--color-surface-sunken);
        border: 1px solid var(--color-border);
        font-family: inherit;
      }
      button.chip {
        cursor: pointer;
        transition:
          color var(--transition-fast),
          border-color var(--transition-fast);
      }
      button.chip:hover {
        color: var(--color-accent);
        border-color: var(--color-accent);
      }
    `,
  ],
})
export class TagChipsComponent {
  readonly tags = input.required<string[]>();
  readonly clickable = input(false);
  readonly tagClick = output<string>();
}
