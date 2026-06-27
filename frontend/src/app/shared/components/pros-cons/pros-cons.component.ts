import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Side-by-side advantages vs. disadvantages comparison. */
@Component({
  selector: 'app-pros-cons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (title()) {
      <p class="pros-cons__title">{{ title() }}</p>
    }
    <div class="pros-cons">
      <div class="pros-cons__col pros-cons__col--pros">
        <p class="pros-cons__heading"><app-icon name="check" [size]="16" /> Pros</p>
        <ul>
          @for (pro of pros(); track pro) {
            <li>{{ pro }}</li>
          }
        </ul>
      </div>
      <div class="pros-cons__col pros-cons__col--cons">
        <p class="pros-cons__heading"><app-icon name="close" [size]="16" /> Cons</p>
        <ul>
          @for (con of cons(); track con) {
            <li>{{ con }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  styleUrl: './pros-cons.component.scss',
})
export class ProsConsComponent {
  readonly title = input<string>();
  readonly pros = input.required<string[]>();
  readonly cons = input.required<string[]>();
}
