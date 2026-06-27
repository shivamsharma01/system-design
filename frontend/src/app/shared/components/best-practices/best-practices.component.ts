import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { MarkdownService } from '../../services/markdown.service';
import { inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Checklist of best practices, each rendered with a check icon. */
@Component({
  selector: 'app-best-practices',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="bp">
      <p class="bp__title">
        <app-icon name="check" [size]="18" />{{ title() || 'Best Practices' }}
      </p>
      <ul class="bp__list">
        @for (practice of practices(); track $index) {
          <li class="bp__item">
            <app-icon name="check" [size]="16" class="bp__check" />
            <span [innerHTML]="render(practice)"></span>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './best-practices.component.scss',
})
export class BestPracticesComponent {
  private readonly markdown = inject(MarkdownService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly title = input<string>();
  readonly practices = input.required<string[]>();

  protected render(value: string): SafeHtml {
    // Strip the wrapping <p> so the bullet stays inline with the check icon.
    const html = this.markdown.render(value).replace(/^<p>|<\/p>\s*$/g, '');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
