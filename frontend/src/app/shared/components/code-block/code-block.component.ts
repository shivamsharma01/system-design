import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HighlightService } from '../../services/highlight.service';
import { splitHighlightedLines } from '../../utils/highlight-lines.util';
import { CopyToClipboardDirective } from '../../directives/copy-to-clipboard.directive';
import { IconComponent } from '../icon/icon.component';

interface CodeLine {
  number: number;
  html: SafeHtml;
  highlighted: boolean;
}

/**
 * Medium/GitHub-style code block: syntax highlighting, optional filename header,
 * copy button, line numbers, per-line highlighting, word-wrap toggle, and
 * collapsible body. Theming is handled entirely via CSS variables.
 */
@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopyToClipboardDirective, IconComponent],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss',
})
export class CodeBlockComponent {
  private readonly highlighter = inject(HighlightService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly code = input.required<string>();
  readonly language = input<string>('plaintext');
  readonly filename = input<string>();
  readonly highlightLines = input<number[]>([]);
  readonly showLineNumbers = input<boolean>(true);
  readonly collapsible = input<boolean>(false);
  readonly collapsed = input<boolean>(false);
  readonly wrap = input<boolean>(false);

  private readonly userCollapsed = signal<boolean | null>(null);
  private readonly userWrap = signal<boolean | null>(null);

  readonly isCollapsed = computed(() => this.userCollapsed() ?? this.collapsed());
  readonly isWrapped = computed(() => this.userWrap() ?? this.wrap());

  readonly languageLabel = computed(() => this.highlighter.resolveLanguage(this.language()));

  readonly lines = computed<CodeLine[]>(() => {
    const highlightSet = new Set(this.highlightLines());
    const html = this.highlighter.highlight(this.code(), this.language());
    return splitHighlightedLines(html).map((lineHtml, index) => ({
      number: index + 1,
      html: this.sanitizer.bypassSecurityTrustHtml(lineHtml || ' '),
      highlighted: highlightSet.has(index + 1),
    }));
  });

  toggleCollapsed(): void {
    this.userCollapsed.set(!this.isCollapsed());
  }

  toggleWrap(): void {
    this.userWrap.set(!this.isWrapped());
  }
}
