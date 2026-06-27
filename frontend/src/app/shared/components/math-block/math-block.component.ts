import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Renders a LaTeX expression with KaTeX. KaTeX is imported lazily so it only
 * ships to pages that actually contain math.
 */
@Component({
  selector: 'app-math-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="math" [class.math--display]="display()">
      <span [innerHTML]="html()"></span>
      @if (caption()) {
        <p class="math__caption">{{ caption() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .math {
        margin: var(--space-4) 0;
      }
      .math--display {
        text-align: center;
        overflow-x: auto;
        padding: var(--space-2) 0;
      }
      .math__caption {
        margin-top: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text-subtle);
        font-style: italic;
        text-align: center;
      }
    `,
  ],
})
export class MathBlockComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly tex = input.required<string>();
  readonly display = input(false);
  readonly caption = input<string>();

  protected readonly html = signal<SafeHtml>('');

  constructor() {
    effect(() => {
      const tex = this.tex();
      const display = this.display();
      void this.render(tex, display);
    });
  }

  private async render(tex: string, display: boolean): Promise<void> {
    const { default: katex } = await import('katex');
    const rendered = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
    });
    this.html.set(this.sanitizer.bypassSecurityTrustHtml(rendered));
  }
}
