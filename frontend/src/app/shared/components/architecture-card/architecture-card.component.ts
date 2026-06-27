import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

/** Card describing an architectural component/service. */
@Component({
  selector: 'app-architecture-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="arch-card">
      <div class="arch-card__icon">
        <app-icon [name]="resolvedIcon()" [size]="22" />
      </div>
      <div class="arch-card__body">
        <p class="arch-card__title">{{ title() }}</p>
        <p class="arch-card__desc">{{ description() }}</p>
        @if (tags().length) {
          <div class="arch-card__tags">
            @for (tag of tags(); track tag) {
              <span class="arch-card__tag">{{ tag }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './architecture-card.component.scss',
})
export class ArchitectureCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>();
  readonly tags = input<string[]>([]);

  protected resolvedIcon(): IconName {
    return (this.icon() as IconName) ?? 'layers';
  }
}
