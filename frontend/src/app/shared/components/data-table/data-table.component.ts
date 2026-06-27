import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Generic responsive table for tabular content blocks. */
@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="table-wrap">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              @for (header of headers(); track header) {
                <th>{{ header }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track $index) {
              <tr>
                @for (cell of row; track $index) {
                  <td>{{ cell }}</td>
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
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  readonly headers = input.required<string[]>();
  readonly rows = input.required<string[][]>();
  readonly caption = input<string>();
}
