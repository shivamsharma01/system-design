import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComparisonRow } from '../../models';
import { IconComponent } from '../icon/icon.component';

/** Feature comparison matrix supporting boolean (check/cross) or text cells. */
@Component({
  selector: 'app-feature-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <figure class="fc-wrap">
      <div class="fc-scroll">
        <table class="fc">
          <thead>
            <tr>
              <th></th>
              @for (col of columns(); track col) {
                <th>{{ col }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.feature) {
              <tr>
                <th scope="row">{{ row.feature }}</th>
                @for (value of row.values; track $index) {
                  <td>
                    @switch (typeName(value)) {
                      @case ('boolean') {
                        @if (value) {
                          <app-icon name="check" [size]="16" class="yes" />
                        } @else {
                          <app-icon name="close" [size]="16" class="no" />
                        }
                      }
                      @default {
                        {{ value }}
                      }
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (caption()) {
        <figcaption>{{ caption() }}</figcaption>
      }
    </figure>
  `,
  styleUrl: './feature-comparison.component.scss',
})
export class FeatureComparisonComponent {
  readonly columns = input.required<string[]>();
  readonly rows = input.required<ComparisonRow[]>();
  readonly caption = input<string>();

  protected readonly typeName = (value: unknown): string => typeof value;
}
