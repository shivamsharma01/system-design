import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApiEndpoint } from '../../models';
import { IconComponent } from '../icon/icon.component';

/** Tabular view of REST endpoints with color-coded HTTP methods. */
@Component({
  selector: 'app-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (title()) {
      <p class="api-table__title">{{ title() }}</p>
    }
    <div class="api-table">
      @for (ep of endpoints(); track ep.method + ep.path) {
        <div class="api-row">
          <span class="api-method" [class]="'api-method--' + ep.method.toLowerCase()">
            {{ ep.method }}
          </span>
          <code class="api-path">{{ ep.path }}</code>
          <span class="api-desc">{{ ep.description }}</span>
          @if (ep.auth) {
            <span class="api-auth" title="Requires authentication">
              <app-icon name="signal" [size]="13" /> auth
            </span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './api-table.component.scss',
})
export class ApiTableComponent {
  readonly title = input<string>();
  readonly endpoints = input.required<ApiEndpoint[]>();
}
