import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DesignMeta } from '../../models';
import { IconComponent } from '../icon/icon.component';

/** Previous / next design navigation shown at the bottom of a design page. */
@Component({
  selector: 'app-prev-next-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <nav class="prev-next" aria-label="Design navigation">
      @if (previous(); as prev) {
        <a class="prev-next__link prev-next__link--prev" [routerLink]="['/designs', prev.slug]">
          <span class="prev-next__dir"><app-icon name="arrow-left" [size]="15" /> Previous</span>
          <span class="prev-next__title">{{ prev.title }}</span>
        </a>
      } @else {
        <span></span>
      }
      @if (next(); as nxt) {
        <a class="prev-next__link prev-next__link--next" [routerLink]="['/designs', nxt.slug]">
          <span class="prev-next__dir">Next <app-icon name="arrow-right" [size]="15" /></span>
          <span class="prev-next__title">{{ nxt.title }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './prev-next-nav.component.scss',
})
export class PrevNextNavComponent {
  readonly previous = input<DesignMeta>();
  readonly next = input<DesignMeta>();
}
