import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MarkdownService } from '../../services/markdown.service';

/**
 * Renders a Markdown string into sanitized, styled HTML (the ".prose" class
 * provides typography for headings, lists, links, inline code, blockquotes...).
 */
@Component({
  selector: 'app-markdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="prose" [innerHTML]="html()"></div>`,
  styleUrl: './markdown.component.scss',
})
export class MarkdownComponent {
  private readonly markdown = inject(MarkdownService);

  readonly value = input.required<string>();

  protected readonly html = computed(() => this.markdown.render(this.value()));
}
