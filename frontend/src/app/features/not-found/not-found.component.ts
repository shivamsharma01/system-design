import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Friendly 404 page. */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="nf">
      <p class="nf__code">404</p>
      <h1 class="nf__title">Page not found</h1>
      <p class="nf__text">
        The design you’re looking for doesn’t exist yet — maybe you could
        <a href="https://github.com/your-org/system-design" target="_blank" rel="noopener">
          contribute it</a
        >?
      </p>
      <a class="nf__btn" routerLink="/">Back to all designs</a>
    </div>
  `,
  styles: [
    `
      .nf {
        text-align: center;
        padding: var(--space-16) var(--space-4);
        max-width: 520px;
        margin: 0 auto;
      }
      .nf__code {
        font-size: 5rem;
        font-weight: 800;
        margin: 0;
        color: var(--color-brand);
        line-height: 1;
      }
      .nf__title {
        margin: var(--space-4) 0 var(--space-2);
      }
      .nf__text {
        color: var(--color-text-muted);
        margin-bottom: var(--space-6);
      }
      .nf__btn {
        display: inline-block;
        padding: var(--space-3) var(--space-5);
        border-radius: var(--radius-md);
        background: var(--color-brand);
        color: #fff;
        font-weight: 600;
        text-decoration: none;
      }
    `,
  ],
})
export class NotFoundComponent {}
