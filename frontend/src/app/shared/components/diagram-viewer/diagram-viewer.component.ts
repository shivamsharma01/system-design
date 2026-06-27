import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from '../../../core/services/theme.service';

let diagramCounter = 0;

/**
 * Renders a Mermaid diagram. Mermaid is imported lazily (it is large and not
 * always present on a page) and the diagram re-renders when the theme changes so
 * it always matches light/dark mode.
 */
@Component({
  selector: 'app-diagram-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <figure class="diagram">
      @if (error()) {
        <pre class="diagram__error">{{ error() }}</pre>
      } @else if (svg()) {
        <div class="diagram__canvas" [innerHTML]="svg()"></div>
      } @else {
        <div class="diagram__loading">Rendering diagram…</div>
      }
      @if (caption()) {
        <figcaption class="diagram__caption">{{ caption() }}</figcaption>
      }
    </figure>
  `,
  styleUrl: './diagram-viewer.component.scss',
})
export class DiagramViewerComponent {
  private readonly theme = inject(ThemeService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly definition = input.required<string>();
  readonly caption = input<string>();

  protected readonly svg = signal<SafeHtml | null>(null);
  protected readonly error = signal<string | null>(null);

  private readonly id = `mermaid-${diagramCounter++}`;
  private readonly renderTheme = computed(() => (this.theme.isDark() ? 'dark' : 'default'));

  constructor() {
    effect(() => {
      const definition = this.definition();
      const theme = this.renderTheme();
      void this.render(definition, theme);
    });
  }

  private async render(definition: string, theme: string): Promise<void> {
    try {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: theme as 'dark' | 'default',
        fontFamily: 'inherit',
      });
      const { svg } = await mermaid.render(`${this.id}-${theme}`, definition);
      this.error.set(null);
      this.svg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    } catch (err) {
      this.error.set(
        `Failed to render diagram: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.svg.set(null);
    }
  }
}
